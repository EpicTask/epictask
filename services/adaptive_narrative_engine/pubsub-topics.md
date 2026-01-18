# Pub/Sub Topics Configuration

This document describes the Pub/Sub topics used by the Adaptive Narrative Engine for event publishing.

## Topic Overview

All topics follow the pattern: `narrative.{category}.{event}.v{version}`

## Topics to Create

### 1. narrative.events.progressed.v1
**Purpose:** Published when a user advances through a story node.

**Event Schema:**
```json
{
  "event_id": "uuid",
  "occurred_at": "2024-01-01T00:00:00.000Z",
  "user_id": "user_123",
  "service": "adaptive-narrative-engine",
  "version": "0.1.0",
  "story_id": "story_1",
  "from_node": "node_1",
  "to_node": "node_2",
  "xp_awarded": 15,
  "age": 10,
  "correlation_id": "corr_uuid"
}
```

**Subscribers:**
- Analytics service (for funnel analysis)
- Parent notification service (for milestone alerts)

### 2. narrative.events.completed.v1
**Purpose:** Published when a user completes a story (reaches terminal node).

**Event Schema:**
```json
{
  "event_id": "uuid",
  "occurred_at": "2024-01-01T00:00:00.000Z",
  "user_id": "user_123",
  "service": "adaptive-narrative-engine",
  "version": "0.1.0",
  "story_id": "story_1",
  "final_node": "node_terminal",
  "total_xp": 250,
  "completion_time_seconds": 1800
}
```

**Subscribers:**
- Achievement/badge service
- Parent notification service
- Analytics service

### 3. narrative.payout.requested.v1
**Purpose:** Published when a payout is requested.

**Event Schema:**
```json
{
  "event_id": "uuid",
  "occurred_at": "2024-01-01T00:00:00.000Z",
  "user_id": "user_123",
  "service": "adaptive-narrative-engine",
  "version": "0.1.0",
  "request_id": "payout_123",
  "wallet_address": "rXXX...",
  "token": "eTask",
  "amount": 0.5,
  "reason": "chapter_completion",
  "story_id": "story_1",
  "node_id": "node_5",
  "correlation_id": "corr_uuid"
}
```

**Subscribers:**
- Parent notification service
- Analytics/monitoring service
- Audit logging service

### 4. narrative.payout.confirmed.v1
**Purpose:** Published when a payout is confirmed on blockchain.

**Event Schema:**
```json
{
  "event_id": "uuid",
  "occurred_at": "2024-01-01T00:00:00.000Z",
  "user_id": "user_123",
  "service": "adaptive-narrative-engine",
  "version": "0.1.0",
  "request_id": "payout_123",
  "transaction_hash": "0xABC...",
  "amount": 0.5,
  "token": "eTask",
  "correlation_id": "corr_uuid"
}
```

**Subscribers:**
- Parent notification service (success notification)
- User notification service
- Analytics service

## Creating Topics in GCP

```bash
# Set project
gcloud config set project task-coin-384722

# Create topics
gcloud pubsub topics create narrative.events.progressed.v1
gcloud pubsub topics create narrative.events.completed.v1
gcloud pubsub topics create narrative.payout.requested.v1
gcloud pubsub topics create narrative.payout.confirmed.v1

# Create subscriptions (for Pub/Sub service)
gcloud pubsub subscriptions create narrative-events-sub \
  --topic=narrative.events.progressed.v1 \
  --push-endpoint=https://[PUBSUB_SERVICE_URL]/narrative/progress

gcloud pubsub subscriptions create narrative-completed-sub \
  --topic=narrative.events.completed.v1 \
  --push-endpoint=https://[PUBSUB_SERVICE_URL]/narrative/completed

gcloud pubsub subscriptions create narrative-payout-requested-sub \
  --topic=narrative.payout.requested.v1 \
  --push-endpoint=https://[PUBSUB_SERVICE_URL]/narrative/payout-requested

gcloud pubsub subscriptions create narrative-payout-confirmed-sub \
  --topic=narrative.payout.confirmed.v1 \
  --push-endpoint=https://[PUBSUB_SERVICE_URL]/narrative/payout-confirmed
```

## IAM Permissions

The ANE service account needs:
- `roles/pubsub.publisher` on all narrative.* topics

The Pub/Sub service account needs:
- `roles/pubsub.subscriber` on all narrative.* topics

## Monitoring

Monitor these metrics in Cloud Monitoring:
- Message publish rate
- Publish latency
- Undelivered message count
- Subscriber acknowledgment rate

## Retention

- Message retention: 7 days (default)
- Dead letter topic: narrative.dlq (for failed deliveries)

## Testing

Use the Pub/Sub emulator for local development:

```bash
# Start emulator
gcloud beta emulators pubsub start --project=task-coin-384722

# Set environment variable
export PUBSUB_EMULATOR_HOST=localhost:8085
```
