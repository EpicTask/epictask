"""Story templates for financial literacy topics."""
from typing import Dict, List, Any


# 5 Initial Financial Literacy Topics
STORY_TEMPLATES = {
    "saving_money": {
        "title": "The Saving Adventure",
        "topic": "saving_money",
        "description": "Learn the importance of saving money for future goals",
        "age_ranges": [(5, 8), (9, 12), (13, 15), (16, 18)],
        "tags": ["saving", "goals", "piggy_bank", "future_planning"],
        "structure": {
            "total_nodes": 8,
            "node_types": [
                {"type": "introduction", "has_choices": False},
                {"type": "choice_point", "has_choices": True, "options": 2},
                {"type": "learning_moment", "has_choices": False},
                {"type": "choice_point", "has_choices": True, "options": 3},
                {"type": "consequence", "has_choices": False},
                {"type": "choice_point", "has_choices": True, "options": 2},
                {"type": "resolution", "has_choices": False},
                {"type": "conclusion", "has_choices": False, "payout_eligible": True}
            ]
        },
        "prompts": {
            "story_premise": "Create a story about a child who wants to buy something special and learns about saving money over time. The child should face choices about spending vs saving.",
            "learning_objectives": [
                "Understand delayed gratification",
                "Learn to set savings goals",
                "Practice making spending decisions",
                "See the value of patience and planning"
            ]
        }
    },
    
    "budgeting_basics": {
        "title": "Budget Builder Quest",
        "topic": "budgeting_basics",
        "description": "Discover how to plan and manage money through budgeting",
        "age_ranges": [(5, 8), (9, 12), (13, 15), (16, 18)],
        "tags": ["budget", "planning", "income", "expenses"],
        "structure": {
            "total_nodes": 10,
            "node_types": [
                {"type": "introduction", "has_choices": False},
                {"type": "choice_point", "has_choices": True, "options": 2},
                {"type": "learning_moment", "has_choices": False},
                {"type": "choice_point", "has_choices": True, "options": 3},
                {"type": "consequence", "has_choices": False},
                {"type": "choice_point", "has_choices": True, "options": 2},
                {"type": "learning_moment", "has_choices": False},
                {"type": "choice_point", "has_choices": True, "options": 2},
                {"type": "resolution", "has_choices": False},
                {"type": "conclusion", "has_choices": False, "payout_eligible": True}
            ]
        },
        "prompts": {
            "story_premise": "Create a story about a child who receives allowance/money and must learn to budget it across different needs and wants. Include scenarios for necessities, savings, and fun.",
            "learning_objectives": [
                "Understand income and expenses",
                "Learn the 50/30/20 budgeting concept (needs/wants/savings)",
                "Practice tracking spending",
                "Experience consequences of over-spending"
            ]
        }
    },
    
    "earning_money": {
        "title": "The Earning Journey",
        "topic": "earning_money",
        "description": "Explore different ways to earn money through work and creativity",
        "age_ranges": [(5, 8), (9, 12), (13, 15), (16, 18)],
        "tags": ["earning", "work", "entrepreneurship", "value_creation"],
        "structure": {
            "total_nodes": 9,
            "node_types": [
                {"type": "introduction", "has_choices": False},
                {"type": "choice_point", "has_choices": True, "options": 3},
                {"type": "learning_moment", "has_choices": False},
                {"type": "choice_point", "has_choices": True, "options": 2},
                {"type": "consequence", "has_choices": False},
                {"type": "choice_point", "has_choices": True, "options": 2},
                {"type": "learning_moment", "has_choices": False},
                {"type": "resolution", "has_choices": False},
                {"type": "conclusion", "has_choices": False, "payout_eligible": True}
            ]
        },
        "prompts": {
            "story_premise": "Create a story about a child who wants to earn money and explores different options like chores, selling items, offering services, or starting a small business.",
            "learning_objectives": [
                "Understand that work creates value",
                "Learn different ways to earn money",
                "Experience the relationship between effort and reward",
                "Explore entrepreneurial thinking"
            ]
        }
    },
    
    "smart_spending": {
        "title": "The Wise Shopper",
        "topic": "smart_spending",
        "description": "Learn to make smart spending choices and avoid impulse buying",
        "age_ranges": [(5, 8), (9, 12), (13, 15), (16, 18)],
        "tags": ["spending", "decision_making", "value", "needs_vs_wants"],
        "structure": {
            "total_nodes": 8,
            "node_types": [
                {"type": "introduction", "has_choices": False},
                {"type": "choice_point", "has_choices": True, "options": 2},
                {"type": "consequence", "has_choices": False},
                {"type": "learning_moment", "has_choices": False},
                {"type": "choice_point", "has_choices": True, "options": 3},
                {"type": "consequence", "has_choices": False},
                {"type": "resolution", "has_choices": False},
                {"type": "conclusion", "has_choices": False, "payout_eligible": True}
            ]
        },
        "prompts": {
            "story_premise": "Create a story about a child shopping with money who must decide between different purchase options, considering quality, price, needs vs wants, and impulse buying.",
            "learning_objectives": [
                "Distinguish between needs and wants",
                "Practice comparison shopping",
                "Resist impulse purchases",
                "Consider long-term value vs immediate gratification"
            ]
        }
    },
    
    "sharing_giving": {
        "title": "The Joy of Giving",
        "topic": "sharing_giving",
        "description": "Discover the importance of generosity and helping others",
        "age_ranges": [(5, 8), (9, 12), (13, 15), (16, 18)],
        "tags": ["giving", "charity", "generosity", "community"],
        "structure": {
            "total_nodes": 7,
            "node_types": [
                {"type": "introduction", "has_choices": False},
                {"type": "choice_point", "has_choices": True, "options": 3},
                {"type": "learning_moment", "has_choices": False},
                {"type": "choice_point", "has_choices": True, "options": 2},
                {"type": "consequence", "has_choices": False},
                {"type": "resolution", "has_choices": False},
                {"type": "conclusion", "has_choices": False, "payout_eligible": True}
            ]
        },
        "prompts": {
            "story_premise": "Create a story about a child who has money and encounters opportunities to help others or contribute to causes. Explore different ways of giving and the impact it creates.",
            "learning_objectives": [
                "Understand the value of helping others",
                "Learn different ways to give (money, time, items)",
                "Experience the emotional rewards of generosity",
                "Consider community and social responsibility"
            ]
        }
    }
}


def get_template(topic: str) -> Dict[str, Any]:
    """
    Get story template by topic.
    
    Args:
        topic: Topic identifier
        
    Returns:
        Template dictionary
        
    Raises:
        KeyError: If topic not found
    """
    if topic not in STORY_TEMPLATES:
        raise KeyError(f"Template not found for topic: {topic}")
    return STORY_TEMPLATES[topic]


def get_all_topics() -> List[str]:
    """
    Get list of all available topics.
    
    Returns:
        List of topic identifiers
    """
    return list(STORY_TEMPLATES.keys())


def get_node_generation_prompt(
    template: Dict[str, Any],
    node_index: int,
    previous_context: str = ""
) -> str:
    """
    Generate a prompt for creating a specific story node.
    
    Args:
        template: Story template
        node_index: Index of node to generate (0-based)
        previous_context: Context from previous nodes
        
    Returns:
        Formatted prompt for LLM
    """
    node_type_info = template["structure"]["node_types"][node_index]
    node_type = node_type_info["type"]
    has_choices = node_type_info.get("has_choices", False)
    num_options = node_type_info.get("options", 0)
    
    prompt = f"""Generate a story node for a financial literacy story about {template['topic']}.

Story Context:
Title: {template['title']}
Description: {template['description']}
Premise: {template['prompts']['story_premise']}

Node Information:
- Node {node_index + 1} of {template['structure']['total_nodes']}
- Type: {node_type}
- Has choices: {has_choices}
"""
    
    if previous_context:
        prompt += f"\nPrevious story context:\n{previous_context}\n"
    
    if has_choices:
        prompt += f"\nThis node requires {num_options} meaningful choices that teach about {template['topic']}.\n"
    
    prompt += """
Generate a JSON object with the following structure:
{
    "title": "Brief node title",
    "prompt": "The main narrative text (2-4 paragraphs)",
    "educational_note": "What financial concept this teaches",
    "options": [
        {
            "text": "Choice text",
            "is_good_choice": true/false,
            "explanation": "Why this choice matters"
        }
    ]
}

Make the story engaging, age-appropriate for kids, and focused on teaching financial literacy.
The prompt should be narrative and immersive, not instructional."""
    
    return prompt
