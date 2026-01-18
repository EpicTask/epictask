# Lesson Recommender Service

Rust-based microservice for adaptive story node recommendations.

## Overview

The Lesson Recommender service provides intelligent next-node selection for the Adaptive Narrative Engine. It ranks candidate nodes based on:
- Age appropriateness
- Difficulty matching
- Topic preferences
- Repetition spacing
- Prerequisite completion

## Technology Stack

- **Language:** Rust 2021 edition
- **Web Framework:** Actix-web 4.4
- **Serialization:** Serde
- **Runtime:** Tokio

## Project Structure

```
services/lesson-recommender/
├── src/
│   ├── main.rs           # HTTP server and endpoints
│   ├── models.rs         # Request/response models
│   └── recommender.rs    # Recommendation logic
├── Cargo.toml            # Dependencies
├── Dockerfile            # Multi-stage build
└── README.md
```

## API Endpoints

### GET /health
Health check endpoint.

**Response:**
```json
{
  "status": "healthy",
  "service": "lesson-recommender",
  "version": "0.1.0"
}
```

### POST /recommend
Get a node recommendation based on user profile and history.

**Request:**
```json
{
  "user_id": "user_123",
  "age": 10,
  "story_id": "story_1",
  "current_node_id": "node_1",
  "history": ["node_0", "node_1"],
  "candidate_nodes": ["node_2_saving", "node_2_spending", "node_2_sharing"],
  "profile": {
    "user_id": "user_123",
    "age": 10,
    "level": 2,
    "preferred_topics": ["saving", "budgeting"],
    "completed_lessons": ["intro_money"]
  }
}
```

**Response:**
```json
{
  "next_node_id": "node_2_saving",
  "confidence": 0.86,
  "rationale": "age-appropriate for 10, matches your skill level, covers a topic you enjoy"
}
```

## Recommendation Algorithm (Phase 1: Rule-Based)

### Scoring Factors

1. **Age Fit (40% weight)**
   - Perfect fit: age in center of age_range
   - Acceptable: age within age_range
   - Rejected: age outside age_range

2. **Difficulty Match (20% weight)**
   - Perfect match: user level == node difficulty
   - Good: ±1 level difference
   - Acceptable: ±2 levels
   - Poor: ±3+ levels

3. **Topic Preference (20% weight)**
   - High: lesson matches preferred topics
   - Neutral: no preference data
   - Low: doesn't match preferences

4. **Repetition Spacing (20% weight)**
   - High: lesson not seen recently
   - Medium: seen 3-5 nodes ago
   - Low: seen in last 2 nodes

5. **Prerequisites**
   - If not met: score multiplied by 0.5
   - If met: no penalty

### Scoring Formula

```
final_score = (age_fit × 0.4) + (difficulty × 0.2) + (topic × 0.2) + (spacing × 0.2)
if !prerequisites_met: final_score × 0.5
```

## Development

### Prerequisites
- Rust 1.75+
- Cargo

### Local Development

```bash
# Navigate to service directory
cd services/lesson-recommender

# Build
cargo build

# Run
cargo run

# Run with custom port
PORT=8081 cargo run

# Run tests
cargo test

# Run with logs
RUST_LOG=debug cargo run
```

### Testing

```bash
# Run all tests
cargo test

# Run with output
cargo test -- --nocapture

# Run specific test
cargo test test_age_fit_perfect

# Check code
cargo check

# Format code
cargo fmt

# Lint
cargo clippy
```

### Docker Build

```bash
# Build image
docker build -t lesson-recommender:latest .

# Run container
docker run -p 8081:8081 lesson-recommender:latest

# With environment variables
docker run -p 8081:8081 \
  -e PORT=8081 \
  -e RUST_LOG=info \
  lesson-recommender:latest
```

## Integration with ANE

The ANE API calls this service during progress advancement:

```python
# In ANE progress route
recommendation = await recommender_client.get_recommendation(
    RecommendRequest(
        user_id=user_id,
        age=age,
        story_id=story_id,
        current_node_id=current_node,
        history=completed_nodes,
        candidate_nodes=available_options,
        profile=user_profile
    )
)

if recommendation:
    next_node_id = recommendation.next_node_id
else:
    # Fallback to simple logic
    next_node_id = default_next_node
```

## Performance Targets

- **Latency:** < 100ms P50, < 300ms P99
- **Throughput:** 1000+ requests/second
- **Memory:** < 50MB per instance

## Fallback Behavior

If the recommender service is unavailable, the ANE API will:
1. Use the default `leads_to` from the selected option
2. Log the fallback occurrence
3. Continue without blocking the user

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `8081` |
| `RUST_LOG` | Log level (error, warn, info, debug, trace) | `info` |

## Phase 2 Enhancements

Future improvements planned:
- Firestore integration for real-time node metadata
- Lightweight ML model (logistic regression)
- A/B testing framework
- Local caching of story metadata
- Feature extraction pipeline
- Confidence calibration

## Monitoring

Key metrics to monitor:
- Request rate
- Response latency
- Recommendation confidence distribution
- Fallback rate (when used vs when unavailable)
- Top recommended nodes

## Deployment

Deploy to Cloud Run:

```bash
# Build and push to GCR
gcloud builds submit --tag gcr.io/task-coin-384722/lesson-recommender

# Deploy to Cloud Run
gcloud run deploy lesson-recommender \
  --image gcr.io/task-coin-384722/lesson-recommender \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --port 8081 \
  --memory 256Mi
```

## Testing the Service

```bash
# Health check
curl http://localhost:8081/health

# Recommendation request
curl -X POST http://localhost:8081/recommend \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "user_123",
    "age": 10,
    "story_id": "story_1",
    "current_node_id": "node_1",
    "history": ["node_0"],
    "candidate_nodes": ["node_2_saving", "node_2_spending"],
    "profile": {
      "user_id": "user_123",
      "age": 10,
      "level": 2,
      "preferred_topics": ["saving"],
      "completed_lessons": []
    }
  }'
```
