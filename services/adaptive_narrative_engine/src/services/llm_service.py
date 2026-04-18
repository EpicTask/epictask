"""LLM service for story generation using OpenAI, Gemini, and Grok.

Set LLM_DISABLED=true to run without LLM credentials (returns stub content).
"""
import logging
import os
from typing import List, Dict, Any, Optional, Literal

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# Master kill-switch — set LLM_DISABLED=true to bypass all LLM calls
LLM_DISABLED = os.getenv("LLM_DISABLED", "true").lower() == "true"

if LLM_DISABLED:
    logging.info("LLM_DISABLED=true — LLM service running in stub mode. No API calls will be made.")


def get_secret(secret: str) -> str:
    """
    Retrieve secret from Google Secret Manager.

    Args:
        secret: Secret name to retrieve

    Returns:
        Secret value as string
    """
    from google.cloud import secretmanager
    client = secretmanager.SecretManagerServiceClient()
    project_id = "api-project-371618"
    version_id = "latest"
    name = f"projects/{project_id}/secrets/{secret}/versions/{version_id}"
    response = client.access_secret_version(request={"name": name})
    return response.payload.data.decode("UTF-8")


# Stub content returned when LLM_DISABLED=true
_STUB_CONTENT = "[LLM disabled] Stub story content for development."
_STUB_AGE_VARIANTS: Dict[str, str] = {
    "5-7": "[LLM disabled] Simple stub for ages 5-7.",
    "8-10": "[LLM disabled] Medium stub for ages 8-10.",
    "11-13": "[LLM disabled] Complex stub for ages 11-13.",
    "14-18": "[LLM disabled] Advanced stub for ages 14-18.",
}


class LLMService:
    """Service for interacting with multiple LLM providers."""

    def __init__(self):
        """Initialize LLM clients. Skips API setup when LLM_DISABLED=true."""
        if LLM_DISABLED:
            logging.info("LLMService: stub mode active — skipping API key loading.")
            self.openai_client = None
            self.gemini_model = None
            return

        # Only import and initialize when LLM is enabled
        try:
            from google.cloud import secretmanager as _sm  # noqa: F401 (validates import)
            import openai
            import google.generativeai as genai

            self.openai_key = get_secret("openai_cal_key")
            self.gemini_key = get_secret("gemini_api")

            openai.api_key = self.openai_key
            self.openai_client = openai.OpenAI(api_key=self.openai_key)

            genai.configure(api_key=self.gemini_key)
            self.gemini_model = genai.GenerativeModel('gemini-1.0-pro')

            logging.info("LLMService: initialized with OpenAI + Gemini.")

        except Exception as e:
            logging.warning(f"LLMService: failed to initialize LLM clients ({e}). Falling back to stub mode.")
            self.openai_client = None
            self.gemini_model = None

    # ------------------------------------------------------------------ #
    # Core generation methods                                              #
    # ------------------------------------------------------------------ #

    async def generate_with_openai(
        self,
        prompt: str,
        temperature: float = 0.7,
        max_tokens: int = 2000
    ) -> str:
        if LLM_DISABLED or self.openai_client is None:
            logging.info("generate_with_openai: returning stub.")
            return _STUB_CONTENT

        logging.info(f"Generating content with OpenAI. Prompt length: {len(prompt)}")
        try:
            response = self.openai_client.chat.completions.create(
                model="gpt-4",
                messages=[
                    {
                        "role": "system",
                        "content": "You are a children's story writer specializing in financial literacy education."
                    },
                    {"role": "user", "content": prompt}
                ],
                temperature=temperature,
                max_tokens=max_tokens
            )
            logging.info("Successfully generated content with OpenAI.")
            return response.choices[0].message.content
        except Exception as e:
            logging.error(f"OpenAI generation error: {str(e)}")
            raise

    async def generate_with_gemini(
        self,
        prompt: str
    ) -> str:
        if LLM_DISABLED or self.gemini_model is None:
            logging.info("generate_with_gemini: returning stub.")
            return _STUB_CONTENT

        logging.info(f"Generating content with Gemini. Prompt length: {len(prompt)}")
        try:
            full_prompt = (
                "You are a children's story writer specializing in financial literacy education.\n\n"
                f"{prompt}"
            )
            response = self.gemini_model.generate_content(full_prompt)
            logging.info("Successfully generated content with Gemini.")
            return response.text
        except Exception as e:
            logging.error(f"Gemini generation error: {str(e)}")
            raise

    async def generate_content(
        self,
        prompt: str,
        provider: Literal["openai", "gemini"] = "openai",
        temperature: float = 0.7,
        max_tokens: int = 2000
    ) -> str:
        if LLM_DISABLED:
            logging.info(f"generate_content [{provider}]: returning stub.")
            return _STUB_CONTENT

        if provider == "openai":
            return await self.generate_with_openai(prompt, temperature, max_tokens)
        elif provider == "gemini":
            return await self.generate_with_gemini(prompt)
        else:
            raise ValueError(f"Unknown provider: {provider}")

    async def generate_age_variants(
        self,
        base_text: str,
        age_ranges: List[tuple],
        provider: Literal["openai", "gemini"] = "openai"
    ) -> Dict[str, str]:
        if LLM_DISABLED:
            logging.info("generate_age_variants: returning stubs for all age ranges.")
            return {
                f"{min_age}-{max_age}": _STUB_AGE_VARIANTS.get(
                    f"{min_age}-{max_age}", f"[LLM disabled] Stub for {min_age}-{max_age}."
                )
                for min_age, max_age in age_ranges
            }

        variants = {}
        for min_age, max_age in age_ranges:
            age_key = f"{min_age}-{max_age}"
            prompt = f"""Adapt the following text to be appropriate for children aged {min_age}-{max_age}.
Adjust vocabulary, sentence complexity, and concepts to match their developmental level.
Keep the core message and educational content, but make it age-appropriate.

Original text:
{base_text}

Age-appropriate version for {min_age}-{max_age} year olds:"""

            adapted_text = await self.generate_content(
                prompt=prompt,
                provider=provider,
                temperature=0.5
            )
            variants[age_key] = adapted_text.strip()

        return variants

    async def generate_age_variants_batch(
        self,
        base_text: str,
        age_ranges: List[tuple],
        provider: Literal["openai", "gemini"] = "openai"
    ) -> Dict[str, str]:
        if LLM_DISABLED:
            logging.info("generate_age_variants_batch: returning stubs for all age ranges.")
            return {
                f"{min_age}-{max_age}": _STUB_AGE_VARIANTS.get(
                    f"{min_age}-{max_age}", f"[LLM disabled] Stub for {min_age}-{max_age}."
                )
                for min_age, max_age in age_ranges
            }

        import json

        age_range_descriptions = "\n".join([
            f"- {min_age}-{max_age} years old"
            for min_age, max_age in age_ranges
        ])
        age_keys = [f'"{min_age}-{max_age}"' for min_age, max_age in age_ranges]

        prompt = f"""Adapt the following text for multiple age groups in a SINGLE response.
For each age range, provide an age-appropriate version. Adjust vocabulary, sentence complexity,
and concepts to match their developmental level. Keep the core message and educational content.

Age ranges needed:
{age_range_descriptions}

Original text:
{base_text}

Return ONLY a JSON object with keys {', '.join(age_keys)} mapping to adapted text.
Example format: {{"5-7": "simplified text here", "8-10": "medium complexity text", "11-14": "full complexity text"}}

JSON response:"""

        response = await self.generate_content(
            prompt=prompt,
            provider=provider,
            temperature=0.5
        )

        try:
            json_str = response
            if "```json" in response:
                json_str = response.split("```json")[1].split("```")[0].strip()
            elif "```" in response:
                json_str = response.split("```")[1].split("```")[0].strip()

            variants = json.loads(json_str)

            for min_age, max_age in age_ranges:
                age_key = f"{min_age}-{max_age}"
                if age_key not in variants:
                    raise ValueError(f"Missing age variant for {age_key}")

            return variants

        except (json.JSONDecodeError, ValueError) as e:
            print(f"Failed to parse batch variants, falling back to sequential: {e}")
            return await self.generate_age_variants(base_text, age_ranges, provider)


# Singleton instance — safe to import at any time
llm_service = LLMService()
