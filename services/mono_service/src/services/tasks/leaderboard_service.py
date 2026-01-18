from typing import Dict, Any, List
from firebase_admin import firestore
from ...storage.db import task_db, get_db, get_collections

class LeaderboardService:
    """Service for managing leaderboards."""

    async def get_family_leaderboard(self, parent_id: str) -> Any:
        """Get family leaderboard for parent view."""
        return task_db.get_family_leaderboard(parent_id)

    async def get_kid_leaderboard_view(self, kid_id: str) -> Any:
        """Get kid-specific leaderboard view."""
        return task_db.get_kid_leaderboard_view(kid_id)

    async def get_enhanced_global_leaderboard(self, limit: int = 100) -> Dict[str, Any]:
        """Get enhanced global leaderboard with token-based scoring only."""
        try:
            db = get_db()
            collections = get_collections()
            
            leaderboard_ref = db.collection(collections.LEADERBOARD)
            query = leaderboard_ref.order_by(
                "token_score", direction=firestore.Query.DESCENDING
            ).limit(limit)
            
            leaderboard_data = []
            for doc in query.stream():
                data = doc.to_dict()
                leaderboard_data.append({
                    "user_id": doc.id,
                    "display_name": data.get("display_name", ""),
                    "tasks_completed": data.get("tasks_completed", 0),
                    "xrp_earned": data.get("xrp_earned", 0.0),
                    "rlusd_earned": data.get("rlusd_earned", 0.0),
                    "etask_earned": data.get("eTask_earned", 0.0),
                    "token_score": data.get("token_score", 0.0),
                    "level": data.get("level", 1),
                    "last_updated": data.get("last_updated")
                })
            
            return {"leaderboard": leaderboard_data, "total_entries": len(leaderboard_data)}
            
        except Exception as e:
            print(f"Error getting global leaderboard: {e}")
            return {"error": f"Failed to get enhanced global leaderboard: {str(e)}"}

leaderboard_service = LeaderboardService()
