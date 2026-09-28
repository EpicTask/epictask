"""Service for generating stories using LLM and templates."""
import asyncio
import json
import logging
import uuid
from datetime import datetime
from typing import Dict, List, Any, Optional, Literal

from src.services.llm_service import llm_service
from src.services.story_templates import get_template, get_all_topics, get_node_generation_prompt
from src.config.firebase_config import db
from src.config.collection_names import collections
from src.domain.models import StoryNode
from src.domain.generation_schema import SCENE_SCHEMA, age_variants_schema
from src.domain.story_reading import READING_LEVELS, validate_generated_reading


# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')


class StoryGeneratorService:
    """Service for generating narrative stories using LLM providers."""
    
    async def generate_story(
        self,
        topic: str,
        provider: Literal["openai", "gemini", "grok"] = "openai",
        custom_params: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Generate a complete story based on template and LLM provider.
        
        Args:
            topic: Story topic from templates
            provider: LLM provider to use
            custom_params: Optional custom parameters to override template
            
        Returns:
            Generated story structure with all nodes
        """
        logging.info(f"Starting story generation for topic: {topic} with provider: {provider}")
        # Get template
        template = get_template(topic)
        
        # Apply custom parameters if provided
        if custom_params:
            template = {**template, **custom_params}
        
        # Generate story ID
        story_id = str(uuid.uuid4())
        
        # Initialize story structure
        story = {
            "story_id": story_id,
            "title": template["title"],
            "topic": template["topic"],
            "description": template["description"],
            "tags": template["tags"],
            "age_min": min(ar[0] for ar in template["age_ranges"]),
            "age_max": max(ar[1] for ar in template["age_ranges"]),
            "total_nodes": template["structure"]["total_nodes"],
            "provider": provider,
            "status": "draft",
            "created_at": datetime.utcnow().isoformat(),
            "nodes": []
        }
        
        # Generate nodes sequentially
        previous_context = ""
        for node_index in range(template["structure"]["total_nodes"]):
            logging.info(f"Generating node {node_index + 1}/{template['structure']['total_nodes']}...")
            
            node = await self._generate_node(
                template=template,
                node_index=node_index,
                previous_context=previous_context,
                provider=provider
            )
            
            story["nodes"].append(node)
            
            # Update context for next node
            previous_context += f"\nNode {node_index + 1}: {node['title']}\n{node['prompt']}\n"
        
        # Generate age variants for all nodes
        logging.info("Generating age-appropriate variants...")
        await self._generate_age_variants(story, template["age_ranges"], provider)
        self._link_story_nodes(story)
        for node in story["nodes"]:
            StoryNode.model_validate(node)
        validate_generated_reading(story)
        
        logging.info(f"Successfully generated story with ID: {story_id}")
        return story
    
    async def _generate_node(
        self,
        template: Dict[str, Any],
        node_index: int,
        previous_context: str,
        provider: str
    ) -> Dict[str, Any]:
        """
        Generate a single story node using LLM.
        
        Args:
            template: Story template
            node_index: Index of node to generate
            previous_context: Previous story context
            provider: LLM provider
            
        Returns:
            Generated node structure
        """
        node_type_info = template["structure"]["node_types"][node_index]
        
        # Generate prompt for this node
        prompt = get_node_generation_prompt(template, node_index, previous_context)
        
        logging.info(f"Generating content for node {node_index + 1}. Prompt: {prompt}")
        # Generate content with LLM
        response = await llm_service.generate_content(
            prompt=prompt,
            provider=provider,
            response_schema=SCENE_SCHEMA,
        )
        
        # Parse JSON response
        try:
            # Extract JSON from response (handle markdown code blocks)
            json_str = response
            if "```json" in response:
                json_str = response.split("```json")[1].split("```")[0].strip()
            elif "```" in response:
                json_str = response.split("```")[1].split("```")[0].strip()
            
            node_data = json.loads(json_str)
            logging.info(f"Successfully parsed JSON response for node {node_index + 1}.")
        except json.JSONDecodeError as e:
            logging.error(f"Failed to parse JSON response for node {node_index + 1}: {e}")
            logging.error(f"Response was: {response}")
            raise ValueError("Story generation did not return valid JSON") from e
        
        # Build node structure
        node = {
            "node_id": str(uuid.uuid4()),
            "order": node_index,
            "title": node_data.get("title", f"Node {node_index + 1}"),
            "prompt": node_data.get("prompt", ""),
            "lesson_key": template["topic"],
            "age_range": [
                min(ar[0] for ar in template["age_ranges"]),
                max(ar[1] for ar in template["age_ranges"]),
            ],
            "is_terminal": node_index == template["structure"]["total_nodes"] - 1,
            "node_type": node_type_info["type"],
            "educational_note": node_data.get("educational_note", ""),
            "xp_reward": self._calculate_xp_reward(node_type_info),
            "payout_eligible": node_type_info.get("payout_eligible", False),
            "options": [],
            "age_variants": {}  # Will be filled later
        }
        
        # Add options if this is a choice point
        if not node["is_terminal"]:
            for option_data in node_data.get("options", []):
                option = {
                    "option_id": str(uuid.uuid4()),
                    "text": option_data.get("text", ""),
                    "is_good_choice": option_data.get("is_good_choice", True),
                    "explanation": option_data.get("explanation", ""),
                    "leads_to": None,  # Linked before returning or saving the story
                    "reward_xp": 0,
                }
                node["options"].append(option)
            if len(node["options"]) != 4:
                raise ValueError("Each generated decision scene must have four base choices")
        
        return node
    
    def _calculate_xp_reward(self, node_type_info: Dict[str, Any]) -> int:
        """Calculate XP reward based on node type."""
        base_xp = {
            "introduction": 5,
            "choice_point": 15,
            "learning_moment": 10,
            "consequence": 10,
            "resolution": 15,
            "conclusion": 25
        }
        return base_xp.get(node_type_info["type"], 10)
    
    async def _generate_age_variants(
        self,
        story: Dict[str, Any],
        age_ranges: List[tuple],
        provider: str
    ):
        """
        Generate age-appropriate text variants for all nodes concurrently using batch processing.
        This is significantly faster than sequential generation.
        
        Args:
            story: Story structure to add variants to
            age_ranges: List of (min_age, max_age) tuples
            provider: LLM provider
        """
        # Create tasks for concurrent processing
        tasks = []
        
        for node in story["nodes"]:
            # Add task for node prompt variants
            tasks.append(self._generate_node_variants(node, age_ranges, provider))
        
        # Execute all tasks concurrently
        await asyncio.gather(*tasks)
    
    async def _generate_node_variants(
        self,
        node: Dict[str, Any],
        age_ranges: List[tuple],
        provider: str
    ):
        """
        Generate age variants for a single node and its options using batch processing.
        
        Args:
            node: Node to generate variants for
            age_ranges: List of (min_age, max_age) tuples
            provider: LLM provider
        """
        levels = [
            level for level in READING_LEVELS
            if any(low <= level["max_age"] and high >= level["min_age"] for low, high in age_ranges)
        ]
        requirements = []
        for level in levels:
            key = f"{level['min_age']}-{level['max_age']}"
            count = 0 if node["is_terminal"] else level["choices"]
            requirements.append(
                f"{key}: prompt <= {level['words']} words; exactly {count} choices, each <= {level['choice_words']} words. {level['guidance']}"
            )
        prompt = (
            "Create age-specific versions of this interactive story scene and its choices together.\n"
            + "\n".join(requirements)
            + "\nKeep the characters, financial concept and decision meanings consistent. For each band, adapt only the first required number of base choices, in the same order. "
              "Young children should make a simple concrete choice; older children should weigh more elaborate tradeoffs. "
              "No lectures, long paragraphs, free-text responses or shaming. A non-final scene ends with one direct question. "
              "For a final scene, provide a short encouraging recap with an empty options array.\n"
            + "Return ONLY JSON: {\"5-8\": {\"prompt\": \"...\", \"options\": [\"choice text\", \"choice text\"]}, ...}, with every requested age band.\n"
            + json.dumps({
                "prompt": node["prompt"],
                "is_terminal": node["is_terminal"],
                "options": [o["text"] for o in node["options"]],
            })
        )
        # One request per scene keeps question and choices coherent across age bands.
        response = await llm_service.generate_content(
            prompt=prompt, provider=provider, response_schema=age_variants_schema(levels)
        )
        if "```" in response:
            response = response.split("```", 2)[1].removeprefix("json").strip()
        variants = json.loads(response)
        for level in levels:
            key = f"{level['min_age']}-{level['max_age']}"
            variant = variants[key]
            count = 0 if node["is_terminal"] else level["choices"]
            if len(variant["options"]) != count:
                raise ValueError(f"Scene {key} needs exactly {count} choices")
            node["age_variants"][key] = variant["prompt"]
            for option, text in zip(node["options"], variant["options"]):
                option.setdefault("age_variants", {})[key] = text
    
    def _link_story_nodes(self, story: Dict[str, Any]):
        """Link the generated multiple-choice decisions to the following scene."""
        nodes = story["nodes"]
        for index, node in enumerate(nodes):
            if node["is_terminal"]:
                node["options"] = []
                continue
            next_id = nodes[index + 1]["node_id"]
            for option in node["options"]:
                option["leads_to"] = next_id

    async def save_draft_story(
        self,
        story: Dict[str, Any]
    ) -> str:
        """
        Save story as draft in Firestore.
        
        Args:
            story: Complete story structure
            
        Returns:
            Story ID
        """
        for node in story["nodes"]:
            StoryNode.model_validate(node)
        validate_generated_reading(story)
        
        # Save to draft_stories collection
        story_ref = db.collection("draft_stories").document(story["story_id"])
        story_ref.set({
            **story,
            "status": "draft",
            "published": False,
            "updated_at": datetime.utcnow().isoformat()
        })
        
        return story["story_id"]
    
    async def publish_story(
        self,
        story_id: str,
        approved_by: str
    ) -> Dict[str, Any]:
        """
        Publish a draft story to production.
        
        Args:
            story_id: Draft story ID
            approved_by: User ID of approver
            
        Returns:
            Published story data
        """
        # Get draft story
        draft_ref = db.collection("draft_stories").document(story_id)
        draft_doc = draft_ref.get()
        
        if not draft_doc.exists:
            raise FileNotFoundError(f"Draft story not found: {story_id}")
        
        story_data = draft_doc.to_dict()
        # Reject invalid drafts before any publication writes. Do not repair data.
        for node in story_data["nodes"]:
            StoryNode.model_validate(node)
        node_ids = {node["node_id"] for node in story_data["nodes"]}
        if not node_ids:
            raise ValueError("Story has no nodes")
        if len(node_ids) != len(story_data["nodes"]) or not all(node_ids):
            raise ValueError("Story nodes must have unique, nonempty IDs")
        for node in story_data["nodes"]:
            for option in node["options"]:
                if option["leads_to"] not in node_ids:
                    raise ValueError(f"Node {node['node_id']} links to a missing node")
        validate_generated_reading(story_data)
        
        # Update status and metadata
        story_data["status"] = "published"
        story_data["published"] = True
        story_data["published_at"] = datetime.utcnow().isoformat()
        story_data["approved_by"] = approved_by
        
        # Save to production stories collection
        story_ref = db.collection(collections.NARRATIVE_STORIES).document(story_id)
        story_ref.set(story_data)
        
        # Save nodes as subcollection
        for node in story_data["nodes"]:
            node_ref = story_ref.collection("nodes").document(node["node_id"])
            node_ref.set(node)
        
        # Update draft status
        draft_ref.update({
            "status": "published",
            "published_at": datetime.utcnow().isoformat()
        })
        
        return story_data
    
    async def get_draft_story(
        self,
        story_id: str
    ) -> Optional[Dict[str, Any]]:
        """
        Get a draft story by ID.
        
        Args:
            story_id: Story ID
            
        Returns:
            Story data or None if not found
        """
        doc = db.collection("draft_stories").document(story_id).get()
        if doc.exists:
            data = doc.to_dict()
            data["story_id"] = doc.id
            return data
        return None
    
    async def list_draft_stories(
        self,
        status: Optional[str] = None,
        limit: int = 50
    ) -> List[Dict[str, Any]]:
        """
        List draft stories.
        
        Args:
            status: Optional status filter (draft, published, rejected)
            limit: Maximum number of results
            
        Returns:
            List of draft stories
        """
        query = db.collection("draft_stories").order_by("created_at", direction="DESCENDING").limit(limit)
        
        if status:
            query = query.where("status", "==", status)
        
        stories = []
        for doc in query.stream():
            data = doc.to_dict()
            data["story_id"] = doc.id
            # Don't include full nodes in list view
            if "nodes" in data:
                data["node_count"] = len(data["nodes"])
                del data["nodes"]
            stories.append(data)
        
        return stories
    
    async def reject_story(
        self,
        story_id: str,
        rejected_by: str,
        reason: str
    ):
        """
        Reject a draft story.
        
        Args:
            story_id: Story ID
            rejected_by: User ID of rejector
            reason: Rejection reason
        """
        draft_ref = db.collection("draft_stories").document(story_id)
        draft_ref.update({
            "status": "rejected",
            "rejected_at": datetime.utcnow().isoformat(),
            "rejected_by": rejected_by,
            "rejection_reason": reason
        })
    
    def get_available_topics(self) -> List[Dict[str, str]]:
        """
        Get list of available story topics.
        
        Returns:
            List of topic info dictionaries
        """
        topics = []
        for topic_id in get_all_topics():
            template = get_template(topic_id)
            topics.append({
                "topic_id": topic_id,
                "title": template["title"],
                "description": template["description"],
                "tags": template["tags"]
            })
        return topics


# Singleton instance
story_generator = StoryGeneratorService()
