"""Service for generating stories using LLM and templates."""
import json
import uuid
from datetime import datetime
from typing import Dict, List, Any, Optional, Literal

from src.services.llm_service import llm_service
from src.services.story_templates import get_template, get_all_topics, get_node_generation_prompt
from src.config.firebase_config import db
from src.config.collection_names import collections


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
            print(f"Generating node {node_index + 1}/{template['structure']['total_nodes']}...")
            
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
        print("Generating age-appropriate variants...")
        await self._generate_age_variants(story, template["age_ranges"], provider)
        
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
        
        # Generate content with LLM
        response = await llm_service.generate_content(
            prompt=prompt,
            provider=provider,
            temperature=0.7
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
        except json.JSONDecodeError as e:
            print(f"Failed to parse JSON response: {e}")
            print(f"Response was: {response}")
            # Fallback structure
            node_data = {
                "title": f"Node {node_index + 1}",
                "prompt": response,
                "educational_note": "Financial literacy concept",
                "options": []
            }
        
        # Build node structure
        node = {
            "node_id": str(uuid.uuid4()),
            "order": node_index,
            "title": node_data.get("title", f"Node {node_index + 1}"),
            "prompt": node_data.get("prompt", ""),
            "node_type": node_type_info["type"],
            "educational_note": node_data.get("educational_note", ""),
            "xp_reward": self._calculate_xp_reward(node_type_info),
            "payout_eligible": node_type_info.get("payout_eligible", False),
            "options": [],
            "age_variants": {}  # Will be filled later
        }
        
        # Add options if this is a choice point
        if node_type_info.get("has_choices", False):
            for option_data in node_data.get("options", []):
                option = {
                    "option_id": str(uuid.uuid4()),
                    "text": option_data.get("text", ""),
                    "is_good_choice": option_data.get("is_good_choice", True),
                    "explanation": option_data.get("explanation", ""),
                    "next_node_id": None  # Will be linked during finalization
                }
                node["options"].append(option)
        
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
        Generate age-appropriate text variants for all nodes.
        
        Args:
            story: Story structure to add variants to
            age_ranges: List of (min_age, max_age) tuples
            provider: LLM provider
        """
        for node in story["nodes"]:
            # Generate variants for the main prompt
            prompt_variants = await llm_service.generate_age_variants(
                base_text=node["prompt"],
                age_ranges=age_ranges,
                provider=provider
            )
            node["age_variants"] = prompt_variants
            
            # Generate variants for option text if present
            for option in node.get("options", []):
                option_variants = await llm_service.generate_age_variants(
                    base_text=option["text"],
                    age_ranges=age_ranges,
                    provider=provider
                )
                option["age_variants"] = option_variants
    
    def _link_story_nodes(self, story: Dict[str, Any]):
        """
        Link story nodes together based on options.
        
        Args:
            story: Story structure to link
        """
        nodes = story["nodes"]
        
        for i, node in enumerate(nodes):
            if node.get("options"):
                # Link each option to the next appropriate node
                next_node_idx = i + 1
                
                for j, option in enumerate(node["options"]):
                    # Simple linear linking for now
                    # Can be enhanced with more sophisticated branching logic
                    if next_node_idx < len(nodes):
                        option["next_node_id"] = nodes[next_node_idx]["node_id"]
                    else:
                        option["next_node_id"] = None  # Terminal node
    
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
        # Link nodes
        self._link_story_nodes(story)
        
        # Save to draft_stories collection
        story_ref = db.collection("draft_stories").document(story["story_id"])
        story_ref.set({
            **story,
            "status": "draft",
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
            raise ValueError(f"Draft story not found: {story_id}")
        
        story_data = draft_doc.to_dict()
        
        # Update status and metadata
        story_data["status"] = "published"
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
