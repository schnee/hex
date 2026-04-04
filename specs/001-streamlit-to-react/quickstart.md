# Quickstart Guide: React + FastAPI Hex Layout Toolkit

**Feature**: 001-streamlit-to-react  
**Date**: 2025-09-22

## Overview
This guide demonstrates the converted React frontend + FastAPI backend system provides identical functionality to the original Streamlit application.

## Prerequisites
- Python 3.12+ with uv package manager
- Node.js 18+ with npm
- Modern web browser (Chrome, Firefox, Safari)

## Quick Start

### 1. Backend Setup
```bash
# Navigate to backend directory
cd backend/

# Install Python dependencies
uv pip sync requirements.txt

# Start FastAPI server
uvicorn main:app --reload --port 8000
```

Expected output:
```
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
INFO:     Started reloader process
```

### 2. Frontend Setup
```bash
# Navigate to frontend directory (new terminal)
cd frontend/

# Install Node.js dependencies
npm install

# Start React development server
npm start
```

Expected output:
```
Compiled successfully!
Local:            http://localhost:3000
```

### 3. Verify API Connection
Open browser to http://localhost:8000/docs to see interactive API documentation.

## User Journey Tests

### Test 1: Pattern Generation
1. **Navigate** to http://localhost:3000
2. **Configure** pattern parameters:
   - Aspect ratio: 16:9
   - Colors: 3 colors with 12 tiles each (36 total)
   - Tendrils: 3
   - Seed: 123
3. **Click** "Generate Patterns"
4. **Verify** 4 pattern variations appear
5. **Compare** with original Streamlit output (same seed)

**Expected Result**: Identical mathematical output, improved UI responsiveness

### Test 2: Interactive Overlay
1. **Generate** patterns (from Test 1)
2. **Navigate** to Overlay tab
3. **Upload** wall image (use `layout.jpg` from project root)
4. **Drag** pattern overlay to different positions
5. **Resize** overlay using corner handles
6. **Observe** real-time dimension updates

**Expected Result**: 
- Smooth 60fps drag interactions
- Instant dimension calculations
- No server requests during positioning
- Identical physical dimensions as Streamlit version

### Test 3: Pattern Download
1. **Right-click** on any generated pattern
2. **Select** "Download PNG" or use download button
3. **Compare** downloaded PNG with Streamlit version (same parameters)

**Expected Result**: Byte-identical PNG files

### Test 4: Parameter Validation
1. **Enter** invalid parameters:
   - Negative tile counts
   - Invalid hex colors
   - Count sum ≠ total tiles
2. **Observe** validation messages
3. **Try** to generate patterns

**Expected Result**: Clear error messages, no API calls with invalid data

## Performance Benchmarks

### Pattern Generation Speed
- **Target**: <500ms for 36-tile pattern
- **Test**: Generate patterns with seed 123, measure response time
- **Baseline**: Compare with Streamlit version

### Overlay Interaction Smoothness  
- **Target**: 60fps drag operations
- **Test**: Monitor browser dev tools performance tab during drag
- **Baseline**: Compare with Streamlit canvas limitations

### File Upload Processing
- **Target**: <2s for 5MB image resize to 800px
- **Test**: Upload high-resolution wall image
- **Baseline**: Compare with Streamlit file uploader

## Integration Validation

### API Contract Compliance
```bash
# Test pattern generation endpoint
curl -X POST http://localhost:8000/api/patterns/generate \
  -H "Content-Type: application/json" \
  -d '{"aspect_w": 16, "aspect_h": 9, "total_tiles": 36, "colors": ["#273c6b", "#92323d", "#D8C03F"], "counts": [12, 12, 12], "color_mode": "random", "seed": 123, "num_layouts": 4}'

# Verify response schema matches OpenAPI contract
```

### Mathematical Accuracy
```bash
# Run backend tests
cd backend/
pytest tests/test_mathematical_accuracy.py

# Compare output with original algorithms
python -m tests.compare_with_streamlit --seed 123
```

## Troubleshooting

### Common Issues

**Backend won't start**
- Check Python version: `python --version`
- Verify dependencies: `uv pip list`
- Check port availability: `lsof -i :8000`

**Frontend build errors**
- Check Node.js version: `node --version`
- Clear npm cache: `npm cache clean --force`
- Delete node_modules: `rm -rf node_modules && npm install`

**CORS errors in browser**
- Verify backend CORS configuration
- Check frontend API_BASE_URL environment variable
- Ensure both servers are running

**Pattern differences from Streamlit**
- Verify identical random seeds
- Check numpy version compatibility
- Run mathematical validation tests

## Success Criteria

✅ **Functional Parity**: All Streamlit features replicated  
✅ **Performance**: Improved overlay interactions  
✅ **Accuracy**: Identical mathematical output  
✅ **Usability**: Better user experience  
✅ **Reliability**: Robust error handling  

This system successfully addresses the limitations mentioned in the original README about the "server-centric model" while maintaining complete backwards compatibility.