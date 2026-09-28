"""Serialize requests through the real OpenAI SDK without network or credentials."""

import asyncio
import json

import httpx
import openai
import pytest

from src.domain.generation_schema import SCENE_SCHEMA, age_variants_schema
from src.domain.story_reading import READING_LEVELS
from src.services import llm_service as module
from src.services import story_generator_service as generator


def completion(content='{"title":"Scene"}', finish_reason="stop", refusal=None):
    return {
        "id": "test-completion",
        "object": "chat.completion",
        "created": 0,
        "model": module.OPENAI_MODEL,
        "choices": [
            {
                "index": 0,
                "finish_reason": finish_reason,
                "message": {"role": "assistant", "content": content, "refusal": refusal},
            }
        ],
    }


@pytest.fixture
async def api(monkeypatch):
    monkeypatch.setattr(module, "LLM_DISABLED", False)
    requests = []
    state = {"response": completion(), "status": 200}

    async def handler(request):
        requests.append(json.loads(request.content))
        assert request.url.path == "/v1/chat/completions"
        return httpx.Response(state["status"], json=state["response"])

    client = openai.AsyncOpenAI(
        api_key="test-key",
        max_retries=0,
        http_client=httpx.AsyncClient(transport=httpx.MockTransport(handler)),
    )
    service = module.LLMService.__new__(module.LLMService)
    service.openai_client = client
    yield service, requests, state
    await client.close()


async def test_nano_request_uses_supported_parameters_and_strict_schema(api):
    service, requests, _ = api
    result = await service.generate_content(
        "Write JSON for a short scene", response_schema=SCENE_SCHEMA
    )
    assert result == '{"title":"Scene"}'
    request = requests[0]
    assert request["model"] == "gpt-5-nano-2025-08-07"
    assert request["max_completion_tokens"] == 4096
    assert request["reasoning_effort"] == "low"
    assert request["verbosity"] == "low"
    assert not {"temperature", "top_p", "max_tokens"} & request.keys()
    assert request["messages"][0]["role"] == "system"
    assert request["messages"][1] == {"role": "user", "content": "Write JSON for a short scene"}
    assert request["response_format"] == {
        "type": "json_schema",
        "json_schema": {"name": "story_content", "strict": True, "schema": SCENE_SCHEMA},
    }


async def test_plain_text_call_and_custom_completion_budget(api):
    service, requests, state = api
    state["response"] = completion("A short story")
    assert (
        await service.generate_content("Write a story", max_completion_tokens=6000)
        == "A short story"
    )
    assert requests[0]["max_completion_tokens"] == 6000
    assert "response_format" not in requests[0]


@pytest.mark.parametrize(
    "content,reason,refusal,error",
    [
        ('{"partial":', "length", None, "incomplete"),
        (None, "content_filter", None, "incomplete"),
        (None, "stop", "Cannot comply", "declined"),
        (None, "stop", None, "empty"),
        ("  ", "stop", None, "empty"),
    ],
)
async def test_partial_or_refused_output_never_reaches_story_parser(
    api, content, reason, refusal, error
):
    service, _, state = api
    state["response"] = completion(content, reason, refusal)
    with pytest.raises(RuntimeError, match=error):
        await service.generate_content("Write JSON", response_schema=SCENE_SCHEMA)


async def test_empty_choices_are_rejected(api):
    service, _, state = api
    state["response"]["choices"] = []
    with pytest.raises(RuntimeError, match="no completion choices"):
        await service.generate_content("Write a story")


async def test_api_errors_propagate_without_stub_fallback(api):
    service, _, state = api
    state.update(
        status=400,
        response={"error": {"message": "Invalid request", "type": "invalid_request_error"}},
    )
    with pytest.raises(openai.BadRequestError):
        await service.generate_content("Write a story")


async def test_missing_client_is_reported_as_configuration_error(api):
    service, _, _ = api
    service.openai_client = None
    with pytest.raises(RuntimeError, match="not configured"):
        await service.generate_content("Write a story")


def test_all_schema_objects_are_closed_and_require_their_fields():
    def check(schema):
        if schema.get("type") == "object":
            assert schema["additionalProperties"] is False
            assert set(schema["required"]) == set(schema["properties"])
            for value in schema["properties"].values():
                check(value)
        elif schema.get("type") == "array":
            check(schema["items"])

    check(SCENE_SCHEMA)
    schema = age_variants_schema(READING_LEVELS)
    assert set(schema["required"]) == {"5-8", "9-12", "13-15", "16-18"}
    check(schema)


async def test_generator_sends_scene_and_age_schemas_through_the_sdk(api, monkeypatch):
    service, requests, state = api
    monkeypatch.setattr(generator, "llm_service", service)
    from src.services.story_templates import get_template

    content = {
        "title": "Coins",
        "prompt": "You have coins. What will you do?",
        "educational_note": "Saving",
        "options": [
            {"text": text, "is_good_choice": True, "explanation": "Consider your goal"}
            for text in ["Save", "Buy lunch", "Share", "Buy a toy"]
        ],
    }
    state["response"] = completion(json.dumps(content))
    story_service = generator.StoryGeneratorService()
    template = get_template("saving_money")
    node = await story_service._generate_node(template, 0, "", "openai")
    state["response"] = completion(
        json.dumps(
            {
                f"{level['min_age']}-{level['max_age']}": {
                    "prompt": "What will you do?",
                    "options": ["Save coins"] * level["choices"],
                }
                for level in READING_LEVELS
            }
        )
    )
    await story_service._generate_node_variants(node, template["age_ranges"], "openai")
    assert requests[0]["response_format"]["json_schema"]["schema"] == SCENE_SCHEMA
    assert requests[1]["response_format"]["json_schema"]["schema"] == age_variants_schema(
        READING_LEVELS
    )
    assert node["age_variants"]["5-8"] == "What will you do?"


async def test_openai_requests_can_run_concurrently(monkeypatch):
    monkeypatch.setattr(module, "LLM_DISABLED", False)
    count = 0
    both_started = asyncio.Event()

    async def handler(request):
        nonlocal count
        count += 1
        if count == 2:
            both_started.set()
        await asyncio.wait_for(both_started.wait(), timeout=2)
        return httpx.Response(200, json=completion("Scene"))

    async with openai.AsyncOpenAI(
        api_key="test-key",
        max_retries=0,
        http_client=httpx.AsyncClient(transport=httpx.MockTransport(handler)),
    ) as client:
        service = module.LLMService.__new__(module.LLMService)
        service.openai_client = client
        results = await asyncio.gather(
            service.generate_content("First"), service.generate_content("Second")
        )
    assert results == ["Scene", "Scene"]
