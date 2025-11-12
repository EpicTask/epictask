"""Client for Lesson Recommender Service integration."""
import os
from typing import Optional
import httpx

from src.domain.models import RecommendRequest, RecommendResponse, UserProfile


class RecommenderClient:
    """Client for interacting with Rust Lesson Recommender Service."""
    
    def __init__(self):
        self.base_url = os.getenv(
            "RECOMMENDER_SERVICE_URL",
            "http://localhost:8081"  # Default for local development
        )
        self.timeout = 5.0  # Fast timeout for recommender
        self.enabled = os.getenv("RECOMMENDER_ENABLED", "true").lower() == "true"
    
    async def get_recommendation(
        self,
        request: RecommendRequest
    ) -> Optional[RecommendResponse]:
        """
        Get a node recommendation from the Rust recommender service.
        
        Args:
            request: Recommendation request with user profile and candidates
            
        Returns:
            RecommendResponse with next_node_id, confidence, and rationale
            Returns None if recommender is unavailable (for fallback)
        """
        if not self.enabled:
            return None
        
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            try:
                response = await client.post(
                    f"{self.base_url}/recommend",
                    json=request.model_dump()
                )
                response.raise_for_status()
                
                data = response.json()
                return RecommendResponse(**data)
                
            except httpx.TimeoutException:
                print(f"Recommender service timeout after {self.timeout}s")
                return None
            except httpx.HTTPError as e:
                print(f"Recommender service error: {str(e)}")
                return None
            except Exception as e:
                print(f"Unexpected error calling recommender: {str(e)}")
                return None
    
    async def health_check(self) -> bool:
        """
        Check if the recommender service is healthy.
        
        Returns:
            True if service is responding, False otherwise
        """
        if not self.enabled:
            return False
        
        async with httpx.AsyncClient(timeout=2.0) as client:
            try:
                response = await client.get(f"{self.base_url}/health")
                return response.status_code == 200
            except:
                return False


# Global instance
recommender_client = RecommenderClient()
