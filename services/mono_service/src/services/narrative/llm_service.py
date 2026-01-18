"""LLM service for story generation using OpenAI, Gemini, and Grok."""
import logging
import os
from typing import List, Dict, Any, Optional, Literal
from google.cloud import secretmanager
import openai
import google.generativeai as genai


# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')



def get_secret(secret: str) -> str:
    """
    Retrieve secret from Google Secret Manager.
    
    Args:
        secret: Secret name to retrieve
        
    Returns:
        Secret value as string
    """
    client = secretmanager.SecretManagerServiceClient()
    project_id = "api-project-371618"
    secret_id = secret
    version_id = "latest"

    # Access the secret version
    name = f"projects/{project_id}/secrets/{secret_id}/versions/{version_id}"
    response = client.access_secret_version(request={"name": name})

    # Extract the secret value
    secret_value = response.payload.data.decode("UTF-8")
    return secret_value


class LLMService:
    """Service for interacting with multiple LLM providers."""
    
    def __init__(self):
        """Initialize LLM clients with API keys from Secret Manager."""
        # Load API keys from Google Secret Manager
        self.openai_key = get_secret("openai_cal_key")
        self.gemini_key = get_secret("gemini_api")
        # self.grok_key = get_secret("GROK_API_KEY")
        
        # Configure OpenAI
        openai.api_key = self.openai_key
        self.openai_client = openai.OpenAI(api_key=self.openai_key)
        
        # Configure Gemini
        genai.configure(api_key=self.gemini_key)
        self.gemini_model = genai.GenerativeModel('gemini-1.0-pro')
        
        # Configure Grok (using OpenAI-compatible API)
        # self.grok_client = openai.OpenAI(
        #     api_key=self.grok_key,
        #     base_url="https://api.x.ai/v1"
        # )
    
    async def generate_with_openai(
        self,
        prompt: str,
        temperature: float = 0.7,
        max_tokens: int = 2000
    ) -> str:
        """
        Generate content using OpenAI GPT-4.
        
        Args:
            prompt: The prompt to send to the model
            temperature: Sampling temperature (0-1)
            max_tokens: Maximum tokens to generate
            
        Returns:
            Generated text content
        """
        logging.info(f"Generating content with OpenAI. Prompt: {prompt}")
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
        """
        Generate content using Google Gemini.
        
        Args:
            prompt: The prompt to send to the model
            temperature: Sampling temperature (0-1)
            
        Returns:
            Generated text content
        """
        logging.info(f"Generating content with Gemini. Prompt: {prompt}")
        try:
            # Add system instruction
            full_prompt = (
                "You are a children's story writer specializing in financial literacy education.\n\n"
                f"{prompt}"
            )
            
            response = self.gemini_model.generate_content(
                full_prompt
            )
            logging.info("Successfully generated content with Gemini.")
            return response.text
        except Exception as e:
            logging.error(f"Gemini generation error: {str(e)}")
            raise
    
    # async def generate_with_grok(
    #     self,
    #     prompt: str,
    #     temperature: float = 0.7,
    #     max_tokens: int = 2000
    # ) -> str:
    #     """
    #     Generate content using Grok.
        
    #     Args:
    #         prompt: The prompt to send to the model
    #         temperature: Sampling temperature (0-1)
    #         max_tokens: Maximum tokens to generate
            
    #     Returns:
    #         Generated text content
    #     """
    #     try:
    #         response = self.grok_client.chat.completions.create(
    #             model="grok-beta",
    #             messages=[
    #                 {
    #                     "role": "system",
    #                     "content": "You are a children's story writer specializing in financial literacy education."
    #                 },
    #                 {"role": "user", "content": prompt}
    #             ],
    #             temperature=temperature,
    #             max_tokens=max_tokens
    #         )
    #         return response.choices[0].message.content
    #     except Exception as e:
    #         print(f"Grok generation error: {str(e)}")
    #         raise
    
    async def generate_content(
        self,
        prompt: str,
        provider: Literal["openai", "gemini"] = "openai",
        temperature: float = 0.7,
        max_tokens: int = 2000
    ) -> str:
        """
        Generate content using specified LLM provider.
        
        Args:
            prompt: The prompt to send to the model
            provider: LLM provider to use
            temperature: Sampling temperature (0-1)
            max_tokens: Maximum tokens to generate
            
        Returns:
            Generated text content
        """
        if provider == "openai":
            return await self.generate_with_openai(prompt, temperature, max_tokens)
        elif provider == "gemini":
            return await self.generate_with_gemini(prompt)
        # elif provider == "grok":
        #     return await self.generate_with_grok(prompt, temperature, max_tokens)
        else:
            raise ValueError(f"Unknown provider: {provider}")
    
    async def generate_age_variants(
        self,
        base_text: str,
        age_ranges: List[tuple],
        provider: Literal["openai", "gemini"] = "openai"
    ) -> Dict[str, str]:
        """
        Generate age-appropriate text variants from base text.
        
        Args:
            base_text: The base text to adapt
            age_ranges: List of (min_age, max_age) tuples
            provider: LLM provider to use
            
        Returns:
            Dictionary mapping age range strings to adapted text
        """
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
                temperature=0.5  # Lower temperature for consistency
            )
            
            variants[age_key] = adapted_text.strip()
        
        return variants
    
    async def generate_age_variants_batch(
        self,
        base_text: str,
        age_ranges: List[tuple],
        provider: Literal["openai", "gemini"] = "openai"
    ) -> Dict[str, str]:
        """
        Generate all age-appropriate text variants in a single LLM call.
        More efficient than generate_age_variants for multiple age ranges.
        
        Args:
            base_text: The base text to adapt
            age_ranges: List of (min_age, max_age) tuples
            provider: LLM provider to use
            
        Returns:
            Dictionary mapping age range strings to adapted text
        """
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
        
        # Parse JSON response
        try:
            # Extract JSON from response (handle markdown code blocks)
            json_str = response
            if "```json" in response:
                json_str = response.split("```json")[1].split("```")[0].strip()
            elif "```" in response:
                json_str = response.split("```")[1].split("```")[0].strip()
            
            variants = json.loads(json_str)
            
            # Validate all expected keys are present
            for min_age, max_age in age_ranges:
                age_key = f"{min_age}-{max_age}"
                if age_key not in variants:
                    raise ValueError(f"Missing age variant for {age_key}")
            
            return variants
            
        except (json.JSONDecodeError, ValueError) as e:
            print(f"Failed to parse batch variants, falling back to sequential: {e}")
            # Fallback to sequential generation
            return await self.generate_age_variants(base_text, age_ranges, provider)


# Singleton instance
llm_service = LLMService()
