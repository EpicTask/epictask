"""Start/exit/resume regressions through real routes and Firestore read adapters.

Cloud storage, authentication and event delivery are replaced in memory. No
Firestore writes, LLM requests or Pub/Sub calls leave this test process.
"""

from copy import deepcopy
import json
from unittest.mock import AsyncMock

import pytest
from fastapi.testclient import TestClient

from src.config.security import get_current_user
from src.domain.models import StoryNode
from src.domain.story_reading import READING_LEVELS
from src.main import app
from src.routes import progress, admin_stories
from src.services import firestore, story_generator_service as generator


class MemoryRef:
    def __init__(self, db, path):
        self.db, self.path = db, path

    def collection(self, name):
        return MemoryRef(self.db, f"{self.path}/{name}".strip("/"))

    document = collection

    def get(self):
        return self

    @property
    def exists(self):
        return self.path in self.db.docs

    @property
    def id(self):
        return self.path.rsplit("/", 1)[-1]

    def to_dict(self):
        return deepcopy(self.db.docs[self.path])

    def order_by(self, field):
        return self

    def stream(self):
        paths = [p for p in self.db.docs if p.rsplit("/", 1)[0] == self.path]
        return [
            MemoryRef(self.db, p)
            for p in sorted(paths, key=lambda p: self.db.docs[p].get("order", 0))
        ]

    def set(self, data):
        self.db.writes.append(self.path)
        self.db.docs[self.path] = deepcopy(data)

    def update(self, data):
        self.set({**self.to_dict(), **data})


class MemoryDB(MemoryRef):
    def __init__(self):
        self.docs, self.writes = {}, []
        super().__init__(self, "")


def authored(node_id="start", age_range=None, **fields):
    return dict(
        node_id=node_id,
        title="Scene",
        lesson_key="saving",
        age_range=age_range or [5, 7],
        prompt="A scene",
        options=[],
        **fields,
    )


@pytest.fixture
def scenario(monkeypatch):
    db = MemoryDB()
    db.docs.update(
        {
            "users/parent": {"children": ["child"], "age": 35},
            "users/child": {"parent_id": "parent", "age": 6},
            "users/stranger": {"age": 15},
            "stories/story": {
                "title": "Saving",
                "topic": "saving",
                "age_min": 5,
                "age_max": 7,
                "published": True,
            },
        }
    )
    monkeypatch.setattr(firestore, "db", db)
    monkeypatch.setattr(firestore.firestore_service, "db", db)
    monkeypatch.setattr(generator, "db", db)
    saved = {}

    async def read(*args):
        return deepcopy(saved) or None

    async def save(value):
        saved.update(value.model_dump())

    monkeypatch.setattr(firestore.firestore_service, "get_progress", AsyncMock(side_effect=read))
    save_mock = AsyncMock(side_effect=save)
    monkeypatch.setattr(firestore.firestore_service, "create_or_update_progress", save_mock)
    events = AsyncMock()
    monkeypatch.setattr(progress, "pubsub_publisher", events)
    app.dependency_overrides[get_current_user] = lambda: {"uid": "parent"}
    monkeypatch.setitem(
        app.dependency_overrides,
        admin_stories.get_admin_user,
        lambda: {"uid": "admin", "admin": True},
    )
    client = TestClient(app, raise_server_exceptions=False)
    return client, db, saved, save_mock, events


def start(client):
    return client.post("/progress/start", json={"user_id": "child", "story_id": "story"})


def resume(client, node_id="start", **params):
    return client.get(f"/stories/story/nodes/{node_id}", params={"user_id": "child", **params})


def test_story_starts_resumes_and_advances_without_losing_progress(scenario):
    client, db, saved, writes, events = scenario
    for index, kind in enumerate(["introduction", "choice_point", "conclusion"]):
        node_id = ["start", "choice", "end"][index]
        db.docs[f"stories/story/nodes/{node_id}"] = {
            "node_id": node_id,
            "node_type": kind,
            "order": index,
            "title": kind,
            "prompt": "Scene",
            "age_variants": {"5-7": "Young scene"},
            "lesson_key": "saving",
            "age_range": [5, 7],
            "is_terminal": index == 2,
            "metadata": {"money_moment": {"id": "saving"}},
            "options": (
                [{"option_id": "save", "text": "Save", "leads_to": "end", "reward_xp": 5}]
                if index == 1
                else [{"text": "Continue", "leads_to": "choice"}] if index == 0 else []
            ),
        }
    response = start(client)
    assert response.status_code == 200, response.text
    first = response.json()["node"]
    assert first["options"][0]["leads_to"] == "choice"
    assert client.get("/progress/child/story").json()["current_node"] == "start"
    assert resume(client).json() == first
    assert first["metadata"]["money_moment"]["id"] == "saving"
    assert first["age_variants"] == {"5-7": "Young scene"}
    moved = client.post(
        "/progress/advance",
        json={
            "user_id": "child",
            "story_id": "story",
            "current_node_id": "start",
            "choice_index": 0,
        },
    )
    assert moved.status_code == 200, moved.text
    assert moved.json()["next_node"]["options"][0]["option_id"] == "save"
    assert resume(client, "choice").json() == moved.json()["next_node"]
    saved["completed_money_moment_ids"] = ["saving"]
    completed = client.post(
        "/progress/advance",
        json={
            "user_id": "child",
            "story_id": "story",
            "current_node_id": "choice",
            "selected_option_id": "save",
        },
    )
    assert completed.status_code == 200, completed.text
    assert completed.json()["story_completed"] is True
    assert resume(client, "end").json()["is_terminal"] is True
    previous = deepcopy(saved)
    writes.reset_mock()
    assert start(client).json()["progress"] == previous
    writes.assert_not_awaited()
    assert saved == previous
    assert events.publish_progress_event.await_args.kwargs["age"] == 6
    assert events.publish_progress_event.await_args.kwargs["user_id"] == "child"
    assert saved["total_xp"] == 5
    assert saved["completed_money_moment_ids"] == ["saving"]
    assert db.writes == []


def test_start_and_resume_use_child_profile_and_ignore_client_age(scenario):
    client, db, saved, writes, _ = scenario
    db.docs["stories/story/nodes/start"] = authored()
    assert start(client).status_code == 200
    assert resume(client, age=10).status_code == 200
    # Standalone child authentication uses the same policy without user_id.
    app.dependency_overrides[get_current_user] = lambda: {"uid": "child"}
    assert client.get("/stories/story/nodes/start").status_code == 200


def test_unrelated_user_cannot_choose_a_child_profile(scenario):
    client, db, saved, writes, _ = scenario
    db.docs["stories/story/nodes/start"] = authored()
    app.dependency_overrides[get_current_user] = lambda: {"uid": "stranger"}
    assert start(client).status_code == 403
    assert resume(client).status_code == 403
    writes.assert_not_awaited()


def test_age_rejection_is_consistent_and_cannot_be_overridden(scenario):
    client, db, saved, writes, _ = scenario
    db.docs["stories/story/nodes/start"] = authored(age_range=[13, 18])
    assert start(client).status_code == 403
    response = resume(client, age=15)
    assert response.status_code == 403
    assert response.json()["detail"] == "This content is not appropriate for age 6"
    writes.assert_not_awaited()


def test_missing_profile_age_does_not_silently_become_ten(scenario):
    client, db, saved, writes, _ = scenario
    db.docs["users/child"].pop("age")
    db.docs["stories/story/nodes/start"] = authored()
    assert start(client).status_code == 422
    assert resume(client, age=6).status_code == 422
    writes.assert_not_awaited()


@pytest.mark.parametrize("invalid", ["schema", "age"])
def test_invalid_next_node_does_not_update_saved_progress(scenario, invalid):
    client, db, saved, writes, events = scenario
    node = authored()
    node["options"] = [{"text": "Continue", "leads_to": "next", "reward_xp": 4}]
    db.docs["stories/story/nodes/start"] = node
    db.docs["stories/story/nodes/next"] = authored("next", [13, 18] if invalid == "age" else [5, 7])
    if invalid == "schema":
        del db.docs["stories/story/nodes/next"]["lesson_key"]
    assert start(client).status_code == 200
    previous = deepcopy(saved)
    writes.reset_mock()
    response = client.post(
        "/progress/advance",
        json={
            "user_id": "child",
            "story_id": "story",
            "current_node_id": "start",
            "choice_index": 0,
        },
    )
    assert response.status_code == (403 if invalid == "age" else 500)
    assert saved == previous
    writes.assert_not_awaited()
    events.publish_progress_event.assert_not_awaited()


@pytest.fixture
def mock_story_llm(monkeypatch):
    def content(prompt, **kwargs):
        if prompt.startswith("Create age-specific versions"):
            scene = json.loads(prompt.splitlines()[-1])
            return json.dumps(
                {
                    f"{level['min_age']}-{level['max_age']}": {
                        "prompt": (
                            "You saved your coins."
                            if scene["is_terminal"]
                            else f"You have {level['min_age']} coins. What will you do?"
                        ),
                        "options": (
                            []
                            if scene["is_terminal"]
                            else [f"Save {index + 1} coins" for index in range(level["choices"])]
                        ),
                    }
                    for level in READING_LEVELS
                }
            )
        return json.dumps(
            {
                "title": "Scene",
                "prompt": "You have coins. What will you do?",
                "options": [{"text": text} for text in ["Save", "Buy lunch", "Share", "Buy a toy"]],
            }
        )

    llm = AsyncMock()
    llm.generate_content.side_effect = content
    monkeypatch.setattr(generator, "llm_service", llm)
    return llm


async def test_new_generation_and_publication_produce_valid_linked_nodes(scenario, mock_story_llm):
    client, db, _, _, _ = scenario
    service = generator.StoryGeneratorService()
    story = await service.generate_story("saving_money")
    nodes = story["nodes"]
    assert nodes[0]["options"][0]["leads_to"] == nodes[1]["node_id"]
    assert nodes[-1]["is_terminal"] is True
    for node in nodes:
        StoryNode.model_validate(node)
    db.docs["draft_stories/generated"] = story
    published = await service.publish_story("generated", "admin")
    assert published["published"] is True
    assert db.docs[f"stories/generated/nodes/{nodes[0]['node_id']}"]["lesson_key"] == "saving_money"
    response = client.post("/progress/start", json={"user_id": "child", "story_id": "generated"})
    assert response.status_code == 200, response.text
    current = response.json()["node"]
    assert len(current["options"]) == 2
    assert current["prompt"] == nodes[0]["age_variants"]["5-8"]
    for _ in range(len(nodes) - 1):
        resumed = client.get(
            f"/stories/generated/nodes/{current['node_id']}", params={"user_id": "child"}
        )
        assert resumed.status_code == 200, resumed.text
        assert resumed.json() == current
        response = client.post(
            "/progress/advance",
            json={
                "user_id": "child",
                "story_id": "generated",
                "current_node_id": current["node_id"],
                "choice_index": 0,
            },
        )
        assert response.status_code == 200, response.text
        current = response.json()["next_node"]
    assert response.json()["story_completed"] is True


async def test_publication_rejects_broken_links_before_writing(scenario):
    _, db, _, _, _ = scenario
    node = authored()
    node["options"] = [{"text": "Continue", "leads_to": "missing"}]
    db.docs["draft_stories/broken"] = {**db.docs["stories/story"], "nodes": [node]}
    with pytest.raises(ValueError, match="missing node"):
        await generator.StoryGeneratorService().publish_story("broken", "admin")
    assert db.writes == []


@pytest.mark.parametrize(
    "age,band,choices", [(6, "5-8", 2), (10, "9-12", 3), (14, "13-15", 3), (17, "16-18", 4)]
)
async def test_reading_level_is_identical_on_start_resume_and_advance(
    scenario, mock_story_llm, age, band, choices
):
    client, db, saved, writes, _ = scenario
    story = await generator.StoryGeneratorService().generate_story("saving_money")
    db.docs["stories/story"] = {**story, "published": True}
    for node in story["nodes"]:
        db.docs[f"stories/story/nodes/{node['node_id']}"] = node
    db.docs["users/child"]["age"] = age
    response = start(client)
    assert response.status_code == 200, response.text
    node = response.json()["node"]
    assert node["prompt"] == story["nodes"][0]["age_variants"][band]
    assert len(node["options"]) == choices
    assert node["options"][0]["text"] == story["nodes"][0]["options"][0]["age_variants"][band]
    assert resume(client, node["node_id"]).json() == node
    moved = client.post(
        "/progress/advance",
        json={
            "user_id": "child",
            "story_id": "story",
            "current_node_id": node["node_id"],
            "choice_index": choices - 1,
        },
    )
    assert moved.status_code == 200, moved.text
    assert len(moved.json()["next_node"]["options"]) == choices
    assert resume(client, moved.json()["next_node"]["node_id"]).json() == moved.json()["next_node"]


@pytest.mark.parametrize(
    "bad_content", ["long_prompt", "long_choice", "missing_variant", "no_question"]
)
async def test_publication_rejects_invalid_reading_content(scenario, mock_story_llm, bad_content):
    client, db, _, _, _ = scenario
    story = await generator.StoryGeneratorService().generate_story("saving_money")
    first = story["nodes"][0]
    if bad_content == "long_prompt":
        first["age_variants"]["5-8"] = "word " * 36 + "?"
    elif bad_content == "long_choice":
        first["options"][0]["age_variants"]["5-8"] = "word " * 7
    elif bad_content == "missing_variant":
        del first["age_variants"]["5-8"]
    else:
        first["age_variants"]["5-8"] = "Here is a long lecture."
    db.docs["draft_stories/invalid"] = story
    response = client.post("/admin/stories/publish", json={"story_id": "invalid"})
    assert response.status_code == 422, response.text
    assert db.writes == []


def test_malformed_content_is_rejected_without_repair_or_progress_write(scenario):
    client, db, _, writes, _ = scenario
    malformed = {
        "node_id": "start",
        "node_type": "introduction",
        "title": "Scene",
        "prompt": "Scene",
        "options": [],
    }
    db.docs["stories/story/nodes/start"] = deepcopy(malformed)
    assert start(client).status_code == 500
    assert resume(client).status_code == 500
    writes.assert_not_awaited()
    assert db.docs["stories/story/nodes/start"] == malformed


@pytest.mark.parametrize("missing", [False, True])
def test_publication_reports_invalid_content_separately_from_missing_drafts(scenario, missing):
    client, db, _, _, _ = scenario
    app.dependency_overrides[get_current_user] = lambda: {"uid": "admin", "admin": True}
    if not missing:
        db.docs["draft_stories/invalid"] = {
            "nodes": [{"node_id": "start", "node_type": "introduction"}]
        }
    response = client.post("/admin/stories/publish", json={"story_id": "invalid"})
    assert response.status_code == (404 if missing else 422), response.text
    assert db.writes == []
