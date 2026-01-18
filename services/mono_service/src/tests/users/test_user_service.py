import pytest
from unittest.mock import patch
from ...services.users.user_service import UserService
from ...domain.user_models import UserProfileUpdate

@pytest.mark.asyncio
async def test_get_user_profile():
    # Setup
    uid = "test_user_123"
    expected_profile = {"uid": uid, "role": "parent"}
    
    # Mock the storage layer
    with patch("src.services.users.user_service.user_db") as mock_db:
        mock_db.get_user_profile.return_value = expected_profile
        
        service = UserService()
        result = await service.get_user_profile(uid)
        
        assert result == expected_profile
        mock_db.get_user_profile.assert_called_once_with(uid)

@pytest.mark.asyncio
async def test_update_profile():
    # Setup
    uid = "test_user_123"
    update_data = UserProfileUpdate(display_name="New Name")
    
    # Mock the storage layer
    with patch("src.services.users.user_service.user_db") as mock_db:
        mock_db.update_user_profile.return_value = True
        
        service = UserService()
        result = await service.update_profile(uid, update_data)
        
        assert result is True
        mock_db.update_user_profile.assert_called_once()
