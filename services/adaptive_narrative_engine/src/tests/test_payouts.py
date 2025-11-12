"""Unit tests for payout functionality."""
import pytest
from datetime import datetime, timedelta
from unittest.mock import Mock, patch, AsyncMock
from fastapi.testclient import TestClient

from src.main import app
from src.services.payout_service import PayoutService
from src.domain.models import PayoutRequest, PayoutRequestRecord

client = TestClient(app)


class TestPayoutService:
    """Tests for PayoutService."""
    
    @pytest.mark.asyncio
    @patch('src.services.payout_service.db')
    async def test_check_rate_limit_under_limit(self, mock_db):
        """Test rate limit check when under limit."""
        service = PayoutService()
        mock_db.collection.return_value.where.return_value.where.return_value.where.return_value.stream.return_value = []
        
        is_allowed, reason = await service.check_rate_limit("user_123")
        
        assert is_allowed is True
        assert reason == ""
    
    @pytest.mark.asyncio
    @patch('src.services.payout_service.db')
    async def test_check_rate_limit_count_exceeded(self, mock_db):
        """Test rate limit check when count limit exceeded."""
        service = PayoutService()
        
        # Mock 10 existing payouts
        mock_docs = [Mock() for _ in range(10)]
        for doc in mock_docs:
            doc.to_dict.return_value = {"amount": 0.5}
        
        mock_db.collection.return_value.where.return_value.where.return_value.where.return_value.stream.return_value = mock_docs
        
        is_allowed, reason = await service.check_rate_limit("user_123")
        
        assert is_allowed is False
        assert "Daily payout limit reached" in reason
    
    @pytest.mark.asyncio
    @patch('src.services.payout_service.db')
    async def test_check_rate_limit_amount_exceeded(self, mock_db):
        """Test rate limit check when amount limit exceeded."""
        service = PayoutService()
        
        # Mock payouts totaling $15
        mock_docs = [Mock() for _ in range(3)]
        for doc in mock_docs:
            doc.to_dict.return_value = {"amount": 5.0}
        
        mock_db.collection.return_value.where.return_value.where.return_value.where.return_value.stream.return_value = mock_docs
        
        is_allowed, reason = await service.check_rate_limit("user_123")
        
        assert is_allowed is False
        assert "amount limit" in reason
    
    @pytest.mark.asyncio
    @patch('src.services.payout_service.db')
    async def test_check_parent_approval_approved(self, mock_db):
        """Test parent approval check when approved."""
        service = PayoutService()
        
        # Mock user document
        user_doc = Mock()
        user_doc.exists = True
        user_doc.to_dict.return_value = {
            "narrative_settings": {"payouts_enabled": True},
            "parent_id": "parent_123"
        }
        
        # Mock parent document
        parent_doc = Mock()
        parent_doc.exists = True
        parent_doc.to_dict.return_value = {
            "wallet_address": "rXXX123"
        }
        
        mock_db.collection.return_value.document.return_value.get.side_effect = [user_doc, parent_doc]
        
        is_approved, wallet = await service.check_parent_approval("kid_123")
        
        assert is_approved is True
        assert wallet == "rXXX123"
    
    @pytest.mark.asyncio
    @patch('src.services.payout_service.db')
    async def test_check_parent_approval_not_enabled(self, mock_db):
        """Test parent approval when payouts not enabled."""
        service = PayoutService()
        
        user_doc = Mock()
        user_doc.exists = True
        user_doc.to_dict.return_value = {
            "narrative_settings": {"payouts_enabled": False},
            "parent_id": "parent_123"
        }
        
        mock_db.collection.return_value.document.return_value.get.return_value = user_doc
        
        is_approved, wallet = await service.check_parent_approval("kid_123")
        
        assert is_approved is False
        assert wallet is None
    
    @pytest.mark.asyncio
    @patch('src.services.payout_service.db')
    async def test_create_payout_request(self, mock_db):
        """Test creating a payout request."""
        service = PayoutService()
        
        mock_doc_ref = Mock()
        mock_doc_ref.id = "payout_123"
        mock_db.collection.return_value.document.return_value = mock_doc_ref
        
        request = PayoutRequest(
            user_id="user_123",
            wallet_address="rXXX123",
            token="eTask",
            amount=0.5,
            reason="chapter_completion",
            story_id="story_1",
            node_id="node_5"
        )
        
        record = await service.create_payout_request(request)
        
        assert record.request_id == "payout_123"
        assert record.user_id == "user_123"
        assert record.status == "pending"
        assert record.correlation_id is not None


class TestPayoutRoutes:
    """Tests for payout API routes."""
    
    @patch('src.routes.payouts.payout_service')
    @patch('src.routes.payouts.get_current_user')
    @patch('src.routes.payouts.get_user_id')
    async def test_request_payout_success(self, mock_user_id, mock_auth, mock_service):
        """Test successful payout request."""
        mock_auth.return_value = {"uid": "user_123"}
        mock_user_id.return_value = "user_123"
        
        mock_service.check_rate_limit = AsyncMock(return_value=(True, ""))
        mock_service.check_parent_approval = AsyncMock(return_value=(True, "rXXX123"))
        
        mock_record = PayoutRequestRecord(
            request_id="payout_123",
            user_id="user_123",
            wallet_address="rXXX123",
            token="eTask",
            amount=0.5,
            reason="chapter_completion",
            story_id="story_1",
            node_id="node_5",
            status="submitted",
            correlation_id="corr_123",
            transaction_hash="txhash123"
        )
        
        mock_service.create_payout_request = AsyncMock(return_value=mock_record)
        mock_service.process_payout = AsyncMock(return_value=mock_record)
        
        response = client.post(
            "/payouts/request",
            headers={"Authorization": "Bearer fake_token"},
            json={
                "user_id": "user_123",
                "wallet_address": "rXXX999",  # Will be overridden
                "token": "eTask",
                "amount": 0.5,
                "reason": "chapter_completion",
                "story_id": "story_1",
                "node_id": "node_5"
            }
        )
        
        assert response.status_code == 201
        assert response.json()["request_id"] == "payout_123"
        assert response.json()["status"] == "submitted"
    
    @patch('src.routes.payouts.payout_service')
    @patch('src.routes.payouts.get_current_user')
    @patch('src.routes.payouts.get_user_id')
    async def test_request_payout_rate_limit_exceeded(self, mock_user_id, mock_auth, mock_service):
        """Test payout request when rate limit exceeded."""
        mock_auth.return_value = {"uid": "user_123"}
        mock_user_id.return_value = "user_123"
        
        mock_service.check_rate_limit = AsyncMock(return_value=(False, "Daily limit reached"))
        
        response = client.post(
            "/payouts/request",
            headers={"Authorization": "Bearer fake_token"},
            json={
                "user_id": "user_123",
                "wallet_address": "rXXX123",
                "token": "eTask",
                "amount": 0.5,
                "reason": "chapter_completion"
            }
        )
        
        assert response.status_code == 429
    
    @patch('src.routes.payouts.payout_service')
    @patch('src.routes.payouts.get_current_user')
    @patch('src.routes.payouts.get_user_id')
    async def test_request_payout_not_approved(self, mock_user_id, mock_auth, mock_service):
        """Test payout request when parent hasn't approved."""
        mock_auth.return_value = {"uid": "user_123"}
        mock_user_id.return_value = "user_123"
        
        mock_service.check_rate_limit = AsyncMock(return_value=(True, ""))
        mock_service.check_parent_approval = AsyncMock(return_value=(False, None))
        
        response = client.post(
            "/payouts/request",
            headers={"Authorization": "Bearer fake_token"},
            json={
                "user_id": "user_123",
                "wallet_address": "rXXX123",
                "token": "eTask",
                "amount": 0.5,
                "reason": "chapter_completion"
            }
        )
        
        assert response.status_code == 403
        assert "not enabled" in response.json()["detail"]
    
    @patch('src.routes.payouts.payout_service')
    @patch('src.routes.payouts.get_current_user')
    @patch('src.routes.payouts.get_user_id')
    async def test_get_payout_request_success(self, mock_user_id, mock_auth, mock_service):
        """Test getting a payout request."""
        mock_auth.return_value = {"uid": "user_123"}
        mock_user_id.return_value = "user_123"
        
        mock_service.get_payout_request = AsyncMock(return_value={
            "request_id": "payout_123",
            "user_id": "user_123",
            "wallet_address": "rXXX123",
            "token": "eTask",
            "amount": 0.5,
            "status": "confirmed",
            "reason": "chapter_completion"
        })
        
        response = client.get(
            "/payouts/payout_123",
            headers={"Authorization": "Bearer fake_token"}
        )
        
        assert response.status_code == 200
        assert response.json()["request_id"] == "payout_123"
    
    @patch('src.routes.payouts.payout_service')
    @patch('src.routes.payouts.get_current_user')
    @patch('src.routes.payouts.get_user_id')
    async def test_get_payout_request_not_found(self, mock_user_id, mock_auth, mock_service):
        """Test getting a non-existent payout request."""
        mock_auth.return_value = {"uid": "user_123"}
        mock_user_id.return_value = "user_123"
        
        mock_service.get_payout_request = AsyncMock(return_value=None)
        
        response = client.get(
            "/payouts/nonexistent",
            headers={"Authorization": "Bearer fake_token"}
        )
        
        assert response.status_code == 404


class TestXRPLClient:
    """Tests for XRPL client."""
    
    @pytest.mark.asyncio
    @patch('httpx.AsyncClient')
    async def test_create_payout_success(self, mock_client_class):
        """Test successful payout creation."""
        from src.services.xrpl_client import XRPLClient
        
        mock_response = Mock()
        mock_response.json.return_value = {"txId": "hash123", "status": "submitted"}
        mock_response.raise_for_status = Mock()
        
        mock_client = AsyncMock()
        mock_client.post = AsyncMock(return_value=mock_response)
        mock_client_class.return_value.__aenter__.return_value = mock_client
        
        client = XRPLClient()
        result = await client.create_payout(
            user_id="user_123",
            wallet_address="rXXX123",
            token="eTask",
            amount=0.5,
            reference="test_ref"
        )
        
        assert result["txId"] == "hash123"
        assert result["status"] == "submitted"
