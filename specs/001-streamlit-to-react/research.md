# Research: Streamlit to React Conversion

**Feature**: 001-streamlit-to-react  
**Date**: 2025-09-22

## Technology Decisions

### Backend Framework: FastAPI
**Decision**: FastAPI for REST API backend  
**Rationale**: 
- Automatic OpenAPI generation for frontend integration
- Excellent performance for mathematical computations
- Native async support for file uploads
- Strong typing with Pydantic models
- Seamless integration with existing numpy/matplotlib code

**Alternatives considered**: Flask (less modern), Django (too heavy)

### Frontend Framework: React 18
**Decision**: React 18 with functional components and hooks  
**Rationale**:
- Mature ecosystem for drag-and-drop interactions
- Excellent state management for pattern/overlay data
- Strong TypeScript support for type safety
- Large selection of UI component libraries

**Alternatives considered**: Vue.js (smaller ecosystem), Svelte (newer)

### Drag-and-Drop Library: react-draggable + react-resizable
**Decision**: Combine react-draggable with react-resizable  
**Rationale**:
- Native React components, no external dependencies
- Fine-grained control over transform operations
- Maintains aspect ratios during resize
- Smooth 60fps interactions

**Alternatives considered**: fabric.js (DOM overhead), react-dnd (complex for this use case)

### State Management: React Context + useReducer
**Decision**: Built-in React state management  
**Rationale**:
- Sufficient complexity for single-user app
- No external dependencies
- Clear data flow for pattern generation

**Alternatives considered**: Redux (overkill), Zustand (unnecessary)

### API Design Pattern: REST with Base64 Images
**Decision**: REST endpoints with base64-encoded PNG responses  
**Rationale**:
- Immediate display in React without additional requests
- Simple caching in frontend state
- Identical to current Streamlit approach

**Alternatives considered**: Separate image serving (additional complexity)

## Key Integration Points

### Mathematical Algorithm Preservation
- Extract `hex_tile_layouts_core.py` into backend service layer
- Maintain identical random number generation with seeds
- Preserve exact PNG generation pipeline
- Validate output byte-for-byte against current system

### File Upload Strategy
- Multipart form data for wall images
- Automatic resizing on backend (PIL/Pillow)
- Return processed image as base64 for frontend display
- Maintain 800px max dimension limit

### Performance Optimizations
- Pattern generation: async/await for non-blocking API
- Frontend: debounced parameter updates
- Overlay interactions: CSS transforms (no API calls)
- Image processing: background workers if needed

## Development Approach

### Migration Strategy
1. **Phase 1**: Backend API development (mathematical core intact)
2. **Phase 2**: Basic React frontend (feature parity)
3. **Phase 3**: Enhanced overlay interactions
4. **Phase 4**: Performance optimization and testing

### Testing Strategy
- Backend: pytest with mathematical validation
- Frontend: Jest/RTL for component behavior
- Integration: API contract tests
- Visual regression: compare PNG outputs

### Deployment Considerations
- Development: Backend on localhost:8000, Frontend on localhost:3000
- Production: Static React build served by FastAPI
- CORS configuration for development workflow