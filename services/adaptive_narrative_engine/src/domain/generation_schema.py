"""Strict OpenAI output contracts. Word limits remain application validation."""


def _object(properties: dict) -> dict:
    return {
        "type": "object",
        "properties": properties,
        "required": list(properties),
        "additionalProperties": False,
    }


SCENE_SCHEMA = _object(
    {
        "title": {"type": "string"},
        "prompt": {"type": "string"},
        "educational_note": {"type": "string"},
        "options": {
            "type": "array",
            "items": _object(
                {
                    "text": {"type": "string"},
                    "is_good_choice": {"type": "boolean"},
                    "explanation": {"type": "string"},
                }
            ),
        },
    }
)


def age_variants_schema(levels: list[dict]) -> dict:
    return _object(
        {
            f"{level['min_age']}-{level['max_age']}": _object(
                {
                    "prompt": {"type": "string"},
                    "options": {"type": "array", "items": {"type": "string"}},
                }
            )
            for level in levels
        }
    )
