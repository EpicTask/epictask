"""Reading limits and presentation shared by generation and the story API."""

from copy import deepcopy


READING_LEVELS = (
    {
        "min_age": 5,
        "max_age": 8,
        "words": 35,
        "choices": 2,
        "choice_words": 6,
        "guidance": "One concrete idea: saving a few coins, needs versus wants, earning through a simple task, or sharing. Use familiar objects and small whole numbers. No percentages, interest, debt, jargon, or multi-step arithmetic. Use 1-2 short sentences followed by one direct, engaging question.",
    },
    {
        "min_age": 9,
        "max_age": 12,
        "words": 65,
        "choices": 3,
        "choice_words": 10,
        "guidance": "Use pocket-money budgets, short savings goals, comparing prices, and simple tradeoffs. Give a short situation followed by one clear decision question.",
    },
    {
        "min_age": 13,
        "max_age": 15,
        "words": 95,
        "choices": 3,
        "choice_words": 16,
        "guidance": "Explore earning, opportunity cost, subscriptions, basic interest, and peer pressure. Offer plausible choices with different short- and long-term consequences, ending with a decision question.",
    },
    {
        "min_age": 16,
        "max_age": 18,
        "words": 130,
        "choices": 4,
        "choice_words": 22,
        "guidance": "Use realistic decisions about work, budgeting, credit, borrowing costs, and risk. Include uncertainty and competing priorities, without personal investment recommendations. End with a decision question.",
    },
)


def reading_level(age: int) -> dict:
    return next(level for level in READING_LEVELS if level["min_age"] <= age <= level["max_age"])


def validate_reading_text(text: str, max_words: int, label: str) -> None:
    if not isinstance(text, str) or not text.strip():
        raise ValueError(f"{label} must contain text")
    if len(text.split()) > max_words:
        raise ValueError(f"{label} must be at most {max_words} words")


def validate_generated_reading(story: dict) -> None:
    """Reject incomplete or overlong generated content before saving/publishing."""
    for node in story["nodes"]:
        for level in READING_LEVELS:
            if level["max_age"] < story["age_min"] or level["min_age"] > story["age_max"]:
                continue
            key = f"{level['min_age']}-{level['max_age']}"
            prompt = node.get("age_variants", {}).get(key)
            validate_reading_text(prompt, level["words"], f"Scene {key}")
            if node["is_terminal"]:
                continue
            if not prompt.rstrip().endswith("?"):
                raise ValueError(f"Scene {key} must end with a decision question")
            if level["min_age"] == 5 and prompt.count("?") != 1:
                raise ValueError("Scenes for ages 5-8 must ask just one question")
            if len(node["options"]) < level["choices"]:
                raise ValueError(f"Scene {key} needs {level['choices']} choices")
            for option in node["options"][: level["choices"]]:
                validate_reading_text(
                    option.get("age_variants", {}).get(key), level["choice_words"], f"Choice {key}"
                )


def present_node(node: dict, age: int) -> dict:
    """Select age-specific copy and choices without modifying the stored node.

    Start, resume and advance use this same view, including choice-index lookup.
    Authored nodes without age variants retain their explicitly authored text.
    """
    result = deepcopy(node)
    level = reading_level(age)
    key = f"{level['min_age']}-{level['max_age']}"
    variants = result.get("age_variants", {})
    if key in variants:
        result["prompt"] = variants[key]
        result["options"] = result["options"][: level["choices"]]
        for option in result["options"]:
            option["text"] = option["age_variants"][key]
    return result
