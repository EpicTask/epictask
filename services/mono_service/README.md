# EpicTask Unified Service (Monorepo)

> **Combining adaptive_narrative_engine, user_management, and task_management into a single, efficient Python/FastAPI service**

---

## 📋 Overview

This monorepo unifies three previously separate services into a single, maintainable codebase:

- **Adaptive Narrative Engine (ANE)** - Story-based learning with AI-generated content
- **Task Management** - Task creation, tracking, and leaderboard system
- **User Management** - User profiles, authentication, and family linking

**Technology Stack:** Python 3.9+, FastAPI, Firebase/Firestore, Google Cloud

---

## 🚀 Quick Navigation

### For Developers
- **[Quick Start Guide](QUICK_START.md)** - Get running in 5 minutes
- **[Migration Guide](MIGRATION_GUIDE.md)** - Complete step-by-step migration process
- **[Directory Structure](DIRECTORY_STRUCTURE.md)** - Project organization and architecture

### Key Information
- **Recommended Language:** Python with FastAPI
- **Migration Time:** 3-4 days (~28 hours)
- **Complexity:** Medium
- **Status:** Ready for implementation

---

## 💡 Why Monorepo?

### Advantages
✅ **Single Deployment** - One service to deploy and monitor  
✅ **Shared Code** - Reduce duplication, increase consistency  
✅ **Unified Auth** - Single authentication layer for all endpoints  
✅ **Simplified Testing** - Test entire stack together  
✅ **Cost Reduction** - One Cloud Run instance instead of three  
✅ **Faster Development** - Share utilities, models, and configurations  
✅ **Easier Debugging** - Single codebase, unified logging  

### Technology Choice: Python/FastAPI
- 2 out of 3 services already use Python/FastAPI
- User management (Node.js) is simple to port
- FastAPI provides automatic OpenAPI docs
- Strong async support and type validation
- Consistent tooling and deployment

---

## 📊 Service Analysis

| Service | Current | Lines | Complexity | Key Features |
|---------|---------|-------|------------|--------------|
| **adaptive_narrative_engine** | Python/FastAPI | ~2000+ | High | AI stories, rewards, LLM integration |
| **task_management** | Python/FastAPI | ~800 | Medium | Tasks, leaderboard, tracking |
| **user_management** | Node.js/Express | ~200 | Low | Profile, family linking |

---

## 🎯 Quick Start

### Prerequisites
- Python 3.9+
- pip
- Firebase service account
- Docker (optional)

### Installation
```bash
# Navigate to directory
cd services/mono_service

# Create virtual environment
python -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your credentials

# Run service
python -m src.main
```

**Service runs at:** `http://localhost:8080`

👉 **[Full Quick Start Guide](QUICK_START.md)**

---

## 📁 Project Structure

```
mono_service/
├── src/
│   ├── main.py                  # FastAPI app entry point
│   ├── config/                  # Firebase, auth, constants
│   ├── domain/                  # Pydantic models
│   ├── storage/                 # Firestore operations
│   ├── services/                # Business logic
│   │   ├── narrative/          # ANE services
│   │   ├── tasks/              # Task services
│   │   └── users/              # User services
│   ├── routes/                  # API endpoints
│   │   ├── narrative/          # ANE routes
│   │   ├── tasks/              # Task routes
│   │   └── users/              # User routes
│   └── tests/                   # Test suite
├── templates/                   # HTML templates
├── requirements.txt             # Dependencies
├── Dockerfile                   # Container config
└── docker-compose.yml          # Docker setup
```

👉 **[Complete Directory Structure](DIRECTORY_STRUCTURE.md)**

---

## 🔄 Migration Process

### 8-Phase Migration Strategy

1. **Setup Monorepo Structure** (1 hour)
2. **Migrate Shared Configuration** (2 hours)
3. **Migrate Domain Models** (3 hours)
4. **Migrate Storage/Database Layer** (2 hours)
5. **Migrate Business Logic Services** (4 hours)
6. **Migrate API Routes** (3 hours)
7. **Create Main Application Entry Point** (2 hours)
8. **Migrate Tests, Docker, and Documentation** (3 hours)

**Total Implementation Time:** ~20 hours  
**With Testing & Deployment:** ~28 hours (3-4 days)

👉 **[Full Migration Guide](MIGRATION_GUIDE.md)**

---

## 🌐 API Endpoints

### Narrative Engine (`/api/narrative/*`)
- Stories: Create, read, update stories
- Progress: Track user progress
- Payouts: Token reward system
- Parent: Dashboard and controls

### Task Management (`/api/tasks/*`)
- Tasks: CRUD operations
- Leaderboard: Family and global rankings
- Tracking: Completion and verification

### User Management (`/api/users/*`)
- Profile: Update user information
- Family: Invite codes and child linking
- Admin: User metrics and analytics

### System (`/`)
- Health check
- API documentation (auto-generated)
- Interactive API tester

**Interactive Docs:** `http://localhost:8080/docs`

---

## 🧪 Testing

```bash
# Run all tests
pytest src/tests/ -v

# Test specific module
pytest src/tests/narrative/ -v
pytest src/tests/tasks/ -v
pytest src/tests/users/ -v

# With coverage
pytest src/tests/ --cov=src --cov-report=html

# View coverage report
open htmlcov/index.html
```

---

## 🐳 Docker Deployment

### Local Docker
```bash
# Build and run
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

### Cloud Run Deployment
```bash
# Build image
gcloud builds submit --tag gcr.io/task-coin-384722/epictask-mono-service

# Deploy
gcloud run deploy epictask-mono-service \
  --image gcr.io/task-coin-384722/epictask-mono-service \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

---

## 🔧 Development

### Common Commands
```bash
# Start with hot reload
uvicorn src.main:app --reload --port 8080

# Format code
black src/

# Lint code
pylint src/

# Install new package
pip install package-name
pip freeze > requirements.txt
```

### Adding New Features
1. Create model in `src/domain/`
2. Add DB operations in `src/storage/`
3. Implement logic in `src/services/`
4. Create routes in `src/routes/`
5. Register in `src/main.py`
6. Add tests in `src/tests/`

---

## 📚 Documentation

- **[Migration Guide](MIGRATION_GUIDE.md)** - Complete migration process with 8 phases
- **[Quick Start](QUICK_START.md)** - Get up and running in 5 minutes
- **[Directory Structure](DIRECTORY_STRUCTURE.md)** - Project organization explained
- **API Docs** - Auto-generated at `/docs` endpoint

---

## 🔐 Environment Variables

**Required:**
```bash
GOOGLE_APPLICATION_CREDENTIALS=src/config/service_accounts/task-coin-384722-4adf1998dd08.json
PORT=8080
CORS_ORIGINS=http://localhost:3000
```

**Optional:**
```bash
OPENAI_API_KEY=your-key
GOOGLE_AI_API_KEY=your-key
XRPL_WALLET_SEED=your-seed
DEBUG=false
```

See `.env.example` for complete configuration options.

---

## 🎯 Migration Timeline

| Week | Activities | Deliverable |
|------|------------|-------------|
| **Week 1** | Phases 1-4: Setup through Storage | Working database layer |
| **Week 2** | Phases 5-6: Services and Routes | All APIs functional |
| **Week 3** | Phase 7-8: Integration and Testing | Deployment-ready service |

**Key Milestones:**
- ✓ Day 1: Project structure and config
- ✓ Day 2: Models and database layer
- ✓ Day 3: Business logic services
- ✓ Day 4: API routes and integration
- ✓ Day 5+: Testing and deployment

---

## ✅ Pre-Migration Checklist

Before starting migration:

- [ ] Read complete migration guide
- [ ] Understand current service architectures
- [ ] Back up all current services
- [ ] Ensure Firebase credentials available
- [ ] Set up Python 3.9+ environment
- [ ] Review API documentation for each service
- [ ] Test current services work properly
- [ ] Document any custom configurations

---

## 🚦 Current Status

**Phase:** Planning Complete  
**Next Step:** Implementation  
**Estimated Start:** When approved  
**Estimated Completion:** 3-4 days from start  

**Documentation Status:**
- ✅ Migration guide complete
- ✅ Directory structure defined
- ✅ Quick start guide ready
- ✅ API mapping documented
- ✅ Timeline established

---

## 🤝 Contributing

1. Read the migration guide
2. Follow the directory structure
3. Write tests for new features
4. Update documentation
5. Submit pull requests

---

## 📞 Support

### Resources
- **FastAPI:** https://fastapi.tiangolo.com/
- **Firebase Admin SDK:** https://firebase.google.com/docs/admin/setup
- **Pydantic:** https://docs.pydantic.dev/
- **Cloud Run:** https://cloud.google.com/run/docs

### Questions?
- Check the documentation files
- Review existing code comments
- Contact the development team

---

## 📝 License

MIT License - See LICENSE file for details

---

## 🎉 Ready to Start?

1. **Read:** [MIGRATION_GUIDE.md](MIGRATION_GUIDE.md) - Understand the complete process
2. **Setup:** [QUICK_START.md](QUICK_START.md) - Get your environment ready
3. **Reference:** [DIRECTORY_STRUCTURE.md](DIRECTORY_STRUCTURE.md) - Know where everything goes
4. **Execute:** Follow Phase 1 of migration guide
5. **Deploy:** Test, iterate, and launch!

---

**Document Version:** 1.0  
**Created:** 2026-01-10  
**Status:** Ready for Implementation  
**Maintained By:** EpicTask Development Team

**Questions? Start with the [Quick Start Guide](QUICK_START.md)!**
