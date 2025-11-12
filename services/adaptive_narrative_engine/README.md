# Adaptive Narrative Engine (ANE) Service

Narrative-first learning engine for ages 5-18 with blockchain rewards (eTask/RLUSD).

## Overview

The ANE service provides story-based educational content with age-appropriate branching narratives and token rewards. It integrates with the existing EpicTask ecosystem including XRPL Management for payouts and Pub/Sub for event tracking.

## Project Structure

```
services/adaptive_narrative_engine/
├── src/
│   ├── config/           # Configuration and Firebase setup
│   ├── domain/           # Pydantic models and validators
│   ├── routes/           # API route handlers (Sprint 2+)
│   ├── services/         # Business logic services (Sprint 2+)
│   ├── adapters/         # External service adapters (Sprint 3+)
│   ├── tests/            # Unit and integration tests
│   └── main.py           # FastAPI application entry point
├── pyproject.toml        # Project metadata and dependencies
├── requirements.txt      # Python dependencies
├── Dockerfile            # Container configuration
├── .gitignore
├── SPRINT_PLAN.md        # Development roadmap
└── README.md             # Original feature specification
```

## Sprint 1 Status: ✅ COMPLETE

### Completed Items

- [x] Project structure and build configuration
- [x] Firebase/Firestore configuration
- [x] Security and authentication (Firebase Auth)
- [x] Collection name constants
- [x] Pydantic models for all domain entities
- [x] Business logic validators
- [x] FastAPI application with health check
- [x] Unit tests for models and validators
- [x] Docker configuration

### API Endpoints (Sprint 1)

- `GET /` - Service information
- `GET /health` - Health check
- `GET /docs` - OpenAPI documentation (auto-generated)

## Getting Started

### Prerequisites

- Python 3.9+
- Firebase service account credentials
- Google Cloud SDK (for deployment)

### Local Development

1. **Install dependencies:**

```bash
cd services/adaptive_narrative_engine
pip install -r requirements.txt
```

2. **Set up Firebase credentials:**

Place your Firebase service account JSON file in:
```
src/config/service_accounts/task-coin-384722-4adf1998dd08.json
```

Or set the environment variable:
```bash
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/service-account.json"
```

3. **Run the service:**

```bash
python -m src.main
# or
uvicorn src.main:app --reload --port 8080
```

4. **Access the API:**
- Service info: http://localhost:8080
- Health check: http://localhost:8080/health
- API docs: http://localhost:8080/docs

### Running Tests

```bash
# Install dev dependencies
pip install pytest pytest-asyncio pytest-cov

# Run all tests
pytest src/tests/

# Run with coverage
pytest src/tests/ --cov=src --cov-report=html

# Run specific test file
pytest src/tests/test_models.py -v
```

### Docker Build

```bash
# Build image
docker build -t ane-service:latest .

# Run container
docker run -p 8080:8080 \
  -e GOOGLE_APPLICATION_CREDENTIALS=/app/src/config/service_accounts/task-coin-384722-4adf1998dd08.json \
  ane-service:latest
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `8080` |
| `CORS_ORIGINS` | Comma-separated list of allowed origins | See main.py |
| `GOOGLE_APPLICATION_CREDENTIALS` | Path to Firebase service account | Auto-detected |
| `DEBUG` | Enable debug mode | `false` |

## Next Steps (Sprint 2)

Sprint 2 will implement:
- Firestore collections (stories, nodes, progress)
- Story retrieval endpoints
- Progress tracking endpoints
- Age-based content filtering
- Sample story data

## Architecture

The service follows a clean architecture pattern:

- **Config Layer**: Firebase, security, constants
- **Domain Layer**: Models, validators, business rules
- **Service Layer**: Business logic (Sprint 2+)
- **Route Layer**: HTTP endpoints (Sprint 2+)
- **Adapter Layer**: External service integrations (Sprint 3+)

## Integration Points

- **Firebase/Firestore**: Data persistence
- **Firebase Auth**: User authentication
- **XRPL Management Service**: Payout processing (Sprint 3)
- **Pub/Sub Service**: Event publishing (Sprint 4)
- **Lesson Recommender (Rust)**: Adaptive routing (Sprint 5)

## Contributing

Follow the sprint plan in `SPRINT_PLAN.md`. Each sprint builds on the previous one.

## Testing Strategy

- **Unit Tests**: Models, validators, business logic
- **Integration Tests**: API endpoints, Firestore operations (Sprint 2+)
- **Load Tests**: Concurrent users (Sprint 10)
- **Security Tests**: Auth, rate limiting (Sprint 10)

## Deployment (Sprint 11)

The service will be deployed to Google Cloud Run with:
- Automatic scaling
- Cloud Monitoring integration
- IAM-based service-to-service auth
- Firestore indexes
- Pub/Sub topic subscriptions
