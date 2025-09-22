# Tasks: Streamlit to React Conversion

## 🎯 Current Status: Backend Complete! 

**✅ COMPLETED: FastAPI Backend Implementation (19/60 tasks)**
- Backend is fully implemented and tested (13 integration tests passing)
- All APIs follow FastAPI best practices with proper error handling
- Mathematical precision validated against original Streamlit implementation
- Ready for frontend development and integration

**🚧 NEXT: Frontend React Implementation**
- ✅ Frontend project setup complete (T002, T004)
- React components and TypeScript interfaces (T013-T017, T030-T040)
- Integration with backend APIs

---

**Input**: Design documents from `specs/001-streamlit-to-react/`
**Prerequisites**: plan.md (required), research.md, data-model.md, contracts/

## Format: `[ID] [P?] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- Include exact file paths in descriptions

## Path Conventions
- **Backend**: `backend/src/`, `backend/tests/`
- **Frontend**: `frontend/src/`, `frontend/tests/`
- Paths follow web application structure from plan.md

## Phase 3.1: Setup

- [x] T001 Create backend project structure with FastAPI, pytest, and mathematical dependencies ✅
- [x] T002 Create frontend project structure with React 18, TypeScript, and testing libraries   ✅
- [x] T003 [P] Configure backend linting (black, ruff) and formatting tools ✅
- [x] T004 [P] Configure frontend linting (ESLint, Prettier) and TypeScript compiler ✅
- [x] T005 [P] Set up backend CORS middleware for development with frontend at localhost:3000 ✅

## Phase 3.2: Tests First (TDD) ⚠️ MUST COMPLETE BEFORE 3.3

**CRITICAL: These tests MUST be written and MUST FAIL before ANY implementation**

### Backend Contract Tests
- [x] T006 [P] Contract test POST /api/patterns/generate in backend/tests/contract/test_patterns_generate.py ✅
- [x] T007 [P] Contract test GET /api/patterns/{pattern_id}/download in backend/tests/contract/test_patterns_download.py ✅
- [x] T008 [P] Contract test POST /api/images/upload in backend/tests/contract/test_images_upload.py ✅
- [x] T009 [P] Contract test POST /api/overlay/calculate in backend/tests/contract/test_overlay_calculate.py ✅

### Backend Integration Tests  
- [x] T010 [P] Integration test pattern generation workflow in backend/tests/integration/test_pattern_generation.py ✅
- [x] T011 [P] Integration test image upload and processing in backend/tests/integration/test_image_processing.py ✅
- [x] T012 [P] Integration test mathematical accuracy vs Streamlit in backend/tests/integration/test_mathematical_accuracy.py ✅

### Frontend Component Tests
- [ ] T013 [P] Component test PatternGenerator form validation in frontend/tests/components/test_PatternGenerator.test.tsx
- [ ] T014 [P] Component test OverlayViewer drag interactions in frontend/tests/components/test_OverlayViewer.test.tsx
- [ ] T015 [P] Component test PatternDisplay grid layout in frontend/tests/components/test_PatternDisplay.test.tsx

### Frontend Integration Tests
- [ ] T016 [P] Integration test pattern generation flow in frontend/tests/integration/test_pattern_flow.test.tsx
- [ ] T017 [P] Integration test overlay positioning flow in frontend/tests/integration/test_overlay_flow.test.tsx

## Phase 3.3: Core Implementation (ONLY after tests are failing)

### Backend Models and Services
- [x] T018 [P] Pydantic models for API requests/responses in backend/src/models/api_models.py ✅
- [x] T019 [P] Extract hex_tile_layouts_core.py to backend/src/services/pattern_service.py ✅
- [x] T020 [P] Image processing service in backend/src/services/image_service.py ✅
- [x] T021 [P] Overlay calculation service in backend/src/services/overlay_service.py ✅

### Backend API Endpoints
- [x] T022 FastAPI main app setup with routers in backend/src/main.py ✅
- [x] T023 POST /api/patterns/generate endpoint in backend/src/api/patterns.py ✅
- [x] T024 GET /api/patterns/{pattern_id}/download endpoint in backend/src/api/patterns.py ✅  
- [x] T025 POST /api/images/upload endpoint in backend/src/api/images.py ✅
- [x] T026 POST /api/overlay/calculate endpoint in backend/src/api/overlay.py ✅

### Backend Error Handling and Validation
- [x] T027 Request validation middleware with Pydantic ✅ (Built into FastAPI endpoints)
- [x] T028 Error handling middleware with structured responses ✅ (HTTPException with proper status codes)
- [ ] T029 [P] Logging configuration for pattern generation operations in backend/src/utils/logging.py

### Frontend Core Components
- [ ] T030 [P] TypeScript interfaces matching backend models in frontend/src/types/api.ts
- [ ] T031 [P] API client service with error handling in frontend/src/services/api.ts
- [ ] T032 [P] Pattern generation form component in frontend/src/components/PatternGenerator.tsx
- [ ] T033 [P] Pattern display grid component in frontend/src/components/PatternDisplay.tsx
- [ ] T034 [P] Image upload component in frontend/src/components/ImageUpload.tsx

### Frontend Interactive Overlay
- [ ] T035 Draggable overlay component with react-draggable in frontend/src/components/OverlayViewer.tsx
- [ ] T036 Real-time dimension calculation hook in frontend/src/hooks/useOverlayDimensions.ts
- [ ] T037 Pattern selection and state management in frontend/src/components/PatternSelector.tsx

### Frontend State Management
- [ ] T038 Pattern store context and reducer in frontend/src/context/PatternContext.tsx
- [ ] T039 Overlay store context and reducer in frontend/src/context/OverlayContext.tsx
- [ ] T040 [P] Custom hooks for API integration in frontend/src/hooks/usePatterns.ts and useImageUpload.ts

## Phase 3.4: Integration

- [ ] T041 Connect PatternService to mathematical algorithms with seed reproduction
- [ ] T042 Integrate ImageService with PIL/Pillow for consistent resizing
- [ ] T043 Wire frontend API calls to backend endpoints with error boundaries
- [ ] T044 Implement file download functionality for patterns
- [ ] T045 Add loading states and progress indicators for long operations

## Phase 3.5: Polish

### Testing and Validation
- [ ] T046 [P] Unit tests for mathematical precision in backend/tests/unit/test_math_precision.py
- [ ] T047 [P] Unit tests for image processing edge cases in backend/tests/unit/test_image_processing.py  
- [ ] T048 [P] Unit tests for React components edge cases in frontend/tests/unit/
- [ ] T049 Performance tests for pattern generation (<500ms) in backend/tests/performance/test_generation_speed.py
- [ ] T050 Performance tests for overlay interactions (60fps) in frontend/tests/performance/test_overlay_performance.test.tsx

### Documentation and Deployment
- [x] T051 [P] Update backend requirements.txt and pyproject.toml with all dependencies ✅
- [ ] T052 [P] Update frontend package.json with all dependencies and build scripts
- [ ] T053 [P] Update main README.md with new architecture and setup instructions
- [x] T054 [P] Create backend/README.md with API documentation and development setup ✅
- [ ] T055 [P] Create frontend/README.md with component documentation and development setup

### Final Validation
- [ ] T056 Run quickstart.md validation tests end-to-end
- [ ] T057 Compare output PNG files with original Streamlit (byte-for-byte validation)
- [ ] T058 Performance benchmarking against original system
- [ ] T059 Cross-browser testing (Chrome, Firefox, Safari)
- [ ] T060 Remove legacy Streamlit files and update project structure

## Dependencies

### Critical Path
1. **Setup** (T001-T005) → **Tests** (T006-T017) → **Implementation** (T018-T040) → **Integration** (T041-T045) → **Polish** (T046-T060)

### Parallel Execution Groups
```bash
# Setup Phase (can run simultaneously)
T003, T004, T005

# Contract Tests Phase (independent files)  
T006, T007, T008, T009, T010, T011, T012, T013, T014, T015, T016, T017

# Backend Models Phase (independent modules)
T018, T019, T020, T021, T029, T030

# Frontend Components Phase (independent components)
T032, T033, T034, T037, T040

# Documentation Phase (independent files)
T051, T052, T053, T054, T055
```

### Sequential Dependencies
- T018 (models) blocks T022-T026 (endpoints)
- T022 (main app) blocks T023-T026 (specific endpoints)  
- T030 (TypeScript types) blocks T031-T040 (frontend implementation)
- T038-T039 (contexts) blocks T032-T037 (components using context)
- T041-T045 (integration) blocks T046-T060 (validation)

## Notes

- **Mathematical Precision**: All tests in T012, T046, T057 must verify identical output to original Streamlit
- **Performance Targets**: T049 (<500ms), T050 (60fps) must meet specified benchmarks  
- **TDD Enforcement**: Implementation tasks T018-T040 cannot begin until corresponding tests are failing
- **Cross-Platform**: T059 must verify functionality across all target browsers
- **Backwards Compatibility**: T057 ensures PNG output remains identical for same parameters

## Validation Checklist

- [x] All contracts have corresponding tests (T006-T009 cover all API endpoints)
- [x] All entities have model tasks (T018 covers all data models)
- [x] All tests come before implementation (Phase 3.2 before 3.3)
- [x] Parallel tasks truly independent (marked [P] tasks use different files)
- [x] Each task specifies exact file path (backend/src/*, frontend/src/*)
- [x] Mathematical accuracy preserved (T012, T046, T057 verify precision)