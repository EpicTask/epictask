"""Tests for payout processing idempotency."""
import pytest
from unittest.mock import Mock, patch, AsyncMock
from src.services.payout_service import PayoutService
from src.domain.models import PayoutRequestRecord


@pytest.mark.asyncio
@patch("src.services.payout_service.xrpl_client")
@patch("src.services.payout_service.db")
async def test_payout_idempotency_duplicate_calls(mock_db, mock_xrpl):
    """Test that process_payout is idempotent and does not pay twice on duplicate invocations."""
    service = PayoutService()

    # Mock XRPL response
    mock_xrpl.create_payout = AsyncMock(return_value={"txId": "tx_hash_123", "status": "submitted"})

    # Mock Firestore document: pending initially, submitted afterwards
    mock_doc_pending = Mock(exists=True)
    mock_doc_pending.to_dict.return_value = {"status": "pending"}
    mock_doc_submitted = Mock(exists=True)
    mock_doc_submitted.to_dict.return_value = {"status": "submitted", "transaction_hash": "tx_hash_123"}

    mock_db.collection.return_value.document.return_value.get.side_effect = [
        mock_doc_pending,
        mock_doc_submitted,
    ]

    record = PayoutRequestRecord(
        request_id="payout_999",
        user_id="user_123",
        wallet_address="rXXX123",
        token="eTask",
        amount=1.0,
        reason="chapter_completion",
        story_id="story_1",
        node_id="node_1",
        status="pending",
        correlation_id="corr_999"
    )

    # First call processes the payout
    res1 = await service.process_payout(record)
    assert res1.status == "submitted"
    assert mock_xrpl.create_payout.await_count == 1

    # Second call for the same record
    res2 = await service.process_payout(res1)
    assert res2.status == "submitted"
    # xrpl_client should NOT be called again
    assert mock_xrpl.create_payout.await_count == 1
