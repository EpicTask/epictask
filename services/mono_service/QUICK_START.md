# Quick Start Guide
## Getting the Mono Service Up and Running

This guide will help you quickly set up and run the unified mono service locally.

---

## Prerequisites

Ensure you have the following installed:

- **Python 3.9+** (check: `python --version`)
- **pip** (check: `pip --version`)
- **Docker** (optional, check: `docker --version`)
- **Git** (check: `git --version`)

---

## 5-Minute Setup

### Step 1: Navigate to Directory
```bash
cd services/mono_service
```

### Step 2: Create Virtual Environment
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### Step 3: Install Dependencies
```bash
pip install -r requirements.txt
```

### Step 4: Configure Environment
```bash
# Copy example environment file
cp .env.example .env

# Edit .env with your credentials
nano .env  # or use your preferred editor
```

**Minimum required in .env:**
```bash
GOOGLE_APPLICATION_CREDENTIALS=src/config/service_accounts/task-coin-384722-4adf1998dd08.json
PORT=8080
CORS_ORIGINS=http://localhost:3000,http://localhost:8080
```

### Step 5: Add Service Account
```bash
# Copy your Firebase service account JSON file
cp /path/to/your/service-account.json src/config/service_accounts/
```

### Step 6: Run the Service
```bash
python -m src.main
```

✅ **Service should now be running at:** `http://localhost:8080`

---

## Verify Installation

### Check Health Endpoint
```bash
curl http://localhost:8080/health
```

**Expected Response:**
```json
{
  "status": "healthy",
  "service": "epictask-unified",
  "version": "1.0.0",
  "timestamp": "2026-01-10T17:30:00-08:00",
  "modules": ["narrative", "tasks", "users"]
}
```

### Access API Documentation
Open in browser: `http://localhost:8080/docs`

This will show the auto-generated FastAPI Swagger UI with all available endpoints.

---

## Quick Test of Each Module

### Test 1: Narrative Module
```bash
# Get stories for a user (requires auth token)
curl -X GET "http://localhost:8080/api/narrative/stories?user_id=test_user" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Test 2: Task Module
```bash
# Get tasks for a user (requires auth token)
curl -X GET "http://localhost:8080/api/tasks/user/test_user" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Test 3: User Module
```bash
# Update user profile (requires auth token)
curl -X PUT "http://localhost:8080/api/users/profile" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"display_name": "Test User"}'
```

---

## Docker Quick Start

### Option A: Docker Run
```bash
# Build image
docker build -t epictask-mono:latest .

# Run container
docker run -p 8080:8080 \
  --env-file .env \
  epictask-mono:latest
```

### Option B: Docker Compose
```bash
# Start service
docker-compose up -d

# View logs
docker-compose logs -f

# Stop service
docker-compose down
```

---

## Common Development Commands

### Run Tests
```bash
# All tests
pytest src/tests/ -v

# Specific module
pytest src/tests/narrative/ -v
pytest src/tests/tasks/ -v
pytest src/tests/users/ -v

# With coverage
pytest src/tests/ --cov=src --cov-report=html
```

### Linting and Formatting
```bash
# Check code quality
pylint src/

# Format code
black src/
```

### Run with Hot Reload (Development)
```bash
uvicorn src.main:app --reload --port 8080
```

### View Logs
```bash
# If running with Python
tail -f logs/app.log

# If running with Docker
docker-compose logs -f mono_service
```

---

## Troubleshooting

### Issue: Import Errors
**Problem:** `ModuleNotFoundError: No module named 'src'`

**Solution:**
```bash
# Make sure you're in the mono_service directory
cd services/mono_service

# Run with Python module syntax
python -m src.main

# Or add to PYTHONPATH
export PYTHONPATH="${PYTHONPATH}:$(pwd)"
```

### Issue: Firebase Authentication Failed
**Problem:** `Could not authenticate with Firebase`

**Solution:**
1. Verify service account file exists:
   ```bash
   ls -la src/config/service_accounts/
   ```
2. Check .env file has correct path
3. Ensure service account has proper permissions

### Issue: Port Already in Use
**Problem:** `Address already in use: Port 8080`

**Solution:**
```bash
# Find process using port 8080
lsof -i :8080

# Kill the process
kill -9 <PID>

# Or use a different port
PORT=8081 python -m src.main
```

### Issue: CORS Errors
**Problem:** `Access to XMLHttpRequest blocked by CORS policy`

**Solution:**
Add your frontend URL to .env:
```bash
CORS_ORIGINS=http://localhost:3000,http://localhost:8080,http://localhost:19006
```

### Issue: Missing Dependencies
**Problem:** `ModuleNotFoundError: No module named 'fastapi'`

**Solution:**
```bash
# Reinstall dependencies
pip install -r requirements.txt

# Or install specific package
pip install fastapi uvicorn
```

---

## Development Workflow

### 1. Create New Feature Branch
```bash
git checkout -b feature/your-feature-name
```

### 2. Make Changes
Edit files in appropriate module:
- Models: `src/domain/`
- Business Logic: `src/services/`
- API Routes: `src/routes/`
- Database: `src/storage/`

### 3. Run Tests
```bash
pytest src/tests/ -v
```

### 4. Test Locally
```bash
python -m src.main
# Test in browser or with curl
```

### 5. Commit Changes
```bash
git add .
git commit -m "feat: add new feature"
git push origin feature/your-feature-name
```

---

## Project Structure Quick Reference

```
src/
├── main.py              # Start here - app entry point
├── config/              # Configuration files
├── domain/              # Data models (Pydantic)
├── storage/             # Database operations
├── services/            # Business logic
└── routes/              # API endpoints
```

**Key Principle:** Routes → Services → Storage → Database

---

## Useful Commands Cheat Sheet

```bash
# Start service (development)
python -m src.main

# Start with hot reload
uvicorn src.main:app --reload

# Run all tests
pytest src/tests/ -v

# Run specific test file
pytest src/tests/narrative/test_models.py -v

# Generate coverage report
pytest --cov=src --cov-report=html

# Docker build
docker build -t epictask-mono:latest .

# Docker run
docker-compose up -d

# View Docker logs
docker-compose logs -f

# Stop Docker
docker-compose down

# Format code
black src/

# Lint code
pylint src/

# Check types
mypy src/

# Install new package
pip install package-name
pip freeze > requirements.txt
```

---

## Environment Variables Quick Reference

**Required:**
- `GOOGLE_APPLICATION_CREDENTIALS` - Path to Firebase service account
- `PORT` - Server port (default: 8080)

**Optional:**
- `CORS_ORIGINS` - Comma-separated allowed origins
- `DEBUG` - Enable debug mode (true/false)
- `OPENAI_API_KEY` - For narrative generation
- `GOOGLE_AI_API_KEY` - For Gemini LLM
- `XRPL_WALLET_SEED` - For blockchain rewards

See `.env.example` for complete list.

---

## Next Steps

After getting the service running:

1. **Read the Migration Guide:** `MIGRATION_GUIDE.md` - Full migration details
2. **Review Architecture:** `DIRECTORY_STRUCTURE.md` - Project organization
3. **Explore API:** Visit `http://localhost:8080/docs` - Interactive API docs
4. **Run Tests:** `pytest src/tests/ -v` - Ensure everything works
5. **Deploy:** Follow deployment guide for Cloud Run

---

## Getting Help

### Documentation
- **Migration Guide:** Full step-by-step migration process
- **Directory Structure:** Complete project layout
- **API Docs:** Auto-generated at `/docs` endpoint

### Resources
- FastAPI Documentation: https://fastapi.tiangolo.com/
- Firebase Admin SDK: https://firebase.google.com/docs/admin/setup
- Pydantic Documentation: https://docs.pydantic.dev/

### Support
- Check existing issues in project repository
- Contact development team
- Review code comments and docstrings

---

## Quick Reference: API Endpoints

### Narrative Engine
```
GET  /api/narrative/stories              # List stories
GET  /api/narrative/stories/{id}         # Get story
POST /api/narrative/stories              # Create story (admin)
GET  /api/narrative/progress/{user_id}   # Get progress
POST /api/narrative/progress             # Update progress
GET  /api/narrative/payouts              # List payouts
POST /api/narrative/payouts              # Create payout
```

### Task Management
```
POST /api/tasks/                         # Create task
GET  /api/tasks/user/{user_id}          # Get user tasks
GET  /api/tasks/{task_id}               # Get task
POST /api/tasks/{task_id}/complete      # Complete task
POST /api/tasks/{task_id}/verify        # Verify task
GET  /api/tasks/leaderboard/family/{id} # Family leaderboard
GET  /api/tasks/leaderboard/enhanced-global # Global leaderboard
```

### User Management
```
PUT    /api/users/profile                # Update profile
DELETE /api/users/account                # Delete account
POST   /api/users/invite-code            # Generate invite code
POST   /api/users/link-child             # Link child account
GET    /api/users/admin/metrics          # User metrics (admin)
```

### System
```
GET /                                    # API tester UI
GET /health                              # Health check
GET /docs                                # API documentation
```

---

**Document Version:** 1.0  
**Last Updated:** 2026-01-10  
**Maintained By:** Development Team

---

## Ready to Start Migration?

Now that you understand how to run the service, proceed with the migration:

👉 **Follow:** `MIGRATION_GUIDE.md` for complete step-by-step instructions
