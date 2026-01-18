"""Unit tests for Pub/Sub publisher."""
import pytest
from unittest.mock import Mock, patch, MagicMock
from datetime import datetime

from src.adapters.pubsub_publisher import PubSubPublisher


class TestPubSubPublisher:
    """Tests for PubSubPublisher."""
    
    @pytest.mark.asyncio
    @patch('src.adapters.pubsub_publisher.pubsub_v1.PublisherClient')
    async def test_publish_progress_event(self, mock_publisher_class):
        """Test publishing a progress event."""
        mock_publisher = Mock()
        mock_future = Mock()
        mock_future.result.return_value = "message_id_123"
        mock_publisher.publish.return_value = mock_future
        mock_publisher_class.return_value = mock_publisher
        
        publisher = PubSubPublisher()
        publisher.publisher = mock_publisher
        
        message_id = await publisher.publish_progress_event(
            user_id="user_123",
            story_id="story_1",
            from_node="node_1",
            to_node="node_2",
            xp_awarded=15,
            age=10
        )
        
        assert message_id == "message_id_123"
        mock_publisher.publish.assert_called_once()
    
    @pytest.mark.asyncio
    @patch('src.adapters.pubsub_publisher.pubsub_v1.PublisherClient')
    async def test_publish_story_completed_event(self, mock_publisher_class):
        """Test publishing a story completion event."""
        mock_publisher = Mock()
        mock_future = Mock()
        mock_future.result.return_value = "message_id_456"
        mock_publisher.publish.return_value = mock_future
        mock_publisher_class.return_value = mock_publisher
        
        publisher = PubSubPublisher()
        publisher.publisher = mock_publisher
        
        message_id = await publisher.publish_story_completed_event(
            user_id="user_123",
            story_id="story_1",
            final_node="terminal_node",
            total_xp=250
        )
        
        assert message_id == "message_id_456"
        mock_publisher.publish.assert_called_once()
    
    @pytest.mark.asyncio
    @patch('src.adapters.pubsub_publisher.pubsub_v1.PublisherClient')
    async def test_publish_payout_requested_event(self, mock_publisher_class):
        """Test publishing a payout requested event."""
        mock_publisher = Mock()
        mock_future = Mock()
        mock_future.result.return_value = "message_id_789"
        mock_publisher.publish.return_value = mock_future
        mock_publisher_class.return_value = mock_publisher
        
        publisher = PubSubPublisher()
        publisher.publisher = mock_publisher
        
        message_id = await publisher.publish_payout_requested_event(
            user_id="user_123",
            request_id="payout_123",
            wallet_address="rXXX123",
            token="eTask",
            amount=0.5,
            reason="chapter_completion",
            story_id="story_1",
            node_id="node_5"
        )
        
        assert message_id == "message_id_789"
        mock_publisher.publish.assert_called_once()
    
    @pytest.mark.asyncio
    @patch('src.adapters.pubsub_publisher.pubsub_v1.PublisherClient')
    async def test_publish_payout_confirmed_event(self, mock_publisher_class):
        """Test publishing a payout confirmed event."""
        mock_publisher = Mock()
        mock_future = Mock()
        mock_future.result.return_value = "message_id_abc"
        mock_publisher.publish.return_value = mock_future
        mock_publisher_class.return_value = mock_publisher
        
        publisher = PubSubPublisher()
        publisher.publisher = mock_publisher
        
        message_id = await publisher.publish_payout_confirmed_event(
            user_id="user_123",
            request_id="payout_123",
            transaction_hash="0xABC123",
            amount=0.5,
            token="eTask"
        )
        
        assert message_id == "message_id_abc"
        mock_publisher.publish.assert_called_once()
    
    @pytest.mark.asyncio
    @patch('src.adapters.pubsub_publisher.pubsub_v1.PublisherClient')
    @patch.dict('os.environ', {'ENV': 'development'})
    async def test_publish_error_raises_in_dev(self, mock_publisher_class):
        """Test that publish errors raise in development."""
        mock_publisher = Mock()
        mock_future = Mock()
        mock_future.result.side_effect = Exception("Pub/Sub error")
        mock_publisher.publish.return_value = mock_future
        mock_publisher_class.return_value = mock_publisher
        
        publisher = PubSubPublisher()
        publisher.publisher = mock_publisher
        
        with pytest.raises(Exception):
            await publisher.publish_progress_event(
                user_id="user_123",
                story_id="story_1",
                from_node="node_1",
                to_node="node_2",
                xp_awarded=15,
                age=10
            )
    
    @pytest.mark.asyncio
    @patch('src.adapters.pubsub_publisher.pubsub_v1.PublisherClient')
    @patch.dict('os.environ', {'ENV': 'production'})
    async def test_publish_error_swallowed_in_prod(self, mock_publisher_class):
        """Test that publish errors are swallowed in production."""
        mock_publisher = Mock()
        mock_future = Mock()
        mock_future.result.side_effect = Exception("Pub/Sub error")
        mock_publisher.publish.return_value = mock_future
        mock_publisher_class.return_value = mock_publisher
        
        publisher = PubSubPublisher()
        publisher.publisher = mock_publisher
        
        # Should not raise, returns None
        result = await publisher.publish_progress_event(
            user_id="user_123",
            story_id="story_1",
            from_node="node_1",
            to_node="node_2",
            xp_awarded=15,
            age=10
        )
        
        assert result is None
    
    def test_create_event_base(self):
        """Test event base structure creation."""
        publisher = PubSubPublisher()
        
        event = publisher._create_event_base("user_123")
        
        assert event["user_id"] == "user_123"
        assert event["service"] == "adaptive-narrative-engine"
        assert event["version"] == "0.1.0"
        assert "event_id" in event
        assert "occurred_at" in event
    
    @pytest.mark.asyncio
    @patch('src.adapters.pubsub_publisher.pubsub_v1.PublisherClient')
    async def test_event_includes_correlation_id(self, mock_publisher_class):
        """Test that events include correlation IDs."""
        mock_publisher = Mock()
        mock_future = Mock()
        mock_future.result.return_value = "message_id"
        mock_publisher.publish.return_value = mock_future
        mock_publisher_class.return_value = mock_publisher
        
        publisher = PubSubPublisher()
        publisher.publisher = mock_publisher
        
        await publisher.publish_progress_event(
            user_id="user_123",
            story_id="story_1",
            from_node="node_1",
            to_node="node_2",
            xp_awarded=15,
            age=10,
            correlation_id="my_corr_id"
        )
        
        # Verify the published message includes correlation_id
        call_args = mock_publisher.publish.call_args
        message_data = call_args[0][1]
        import json
        message = json.loads(message_data.decode('utf-8'))
        
        assert message["correlation_id"] == "my_corr_id"
