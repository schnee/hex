# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

The Hex Layout Toolkit is a Python-based Streamlit web application for designing and visualizing custom hexagonal tile layouts for acoustic panels, decorative walls, and interior design applications. It features aspect-aware generation, color strategies, and interactive overlay visualization.

## Essential Commands

### Environment Setup
```bash
# Create virtual environment using uv
uv venv

# Activate virtual environment (macOS/Linux)
source .venv/bin/activate

# Install dependencies
uv pip sync requirements.txt
```

### Development Commands
```bash
# Run the main Streamlit application
streamlit run streamlit_app.py

# Run the standalone Python entry point (minimal functionality)
python main.py

# Install a new package and update requirements
uv add <package-name>
```

### Testing and Development
```bash
# Check if modules can be imported (quick sanity check)
python -c "from app.hex_tile_layouts_core import LayoutParams; print('Core imports OK')"

# Run with specific port
streamlit run streamlit_app.py --server.port 8502

# Run in development mode with auto-reload
streamlit run streamlit_app.py --server.runOnSave true
```

## Architecture Overview

### Core Components

**`app/hex_tile_layouts_core.py`** - The mathematical engine of the application
- Contains all hexagonal grid calculations using axial coordinate system
- Implements layout generation algorithms (blob growth, aspect-aware generation)
- Handles color assignment strategies (random, gradient, scheme60 rule)
- Pure Python logic with no Streamlit dependencies for reusability
- Key classes: `Hex`, `LayoutParams`
- Main functions: `generate_layout()`, `grow_blob()`, `add_tendrils()`

**`app/generators.py`** - Alternative layout generation algorithms
- Ellipse-mask layout generator for compact, aspect-aware designs
- Compact growth algorithm with cohesion and anti-line bias
- Provides different approaches to hexagonal pattern generation

**`streamlit_app.py`** - Main application entry point
- Thin routing layer handling navigation between tabs
- Initializes session state for pattern storage and overlay positioning
- Navigation: Generator → Overlay → About

### UI Architecture (Tabs)

**`app/tabs/generator.py`** - Pattern generation interface
- Sidebar controls for aspect ratios, colors, tendrils, and layout parameters
- Generates multiple layout variations with different seeds
- Stores generated patterns in session state for use in overlay view
- Supports both matplotlib plots (with borders) and PNG exports

**`app/tabs/overlay.py`** - Interactive wall visualization
- Uses `streamlit-drawable-canvas` for drag-and-drop overlay functionality
- Handles image resizing and scaling for performance
- Manages overlay state (position, scale) in session storage
- Converts patterns to base64 for canvas rendering

### Mathematical Foundation

**Hexagonal Grid System:**
- Uses axial coordinates (q, r) for pointy-topped hexagons
- Conversion to pixel coordinates: `x = R * (1.5 * q)`, `y = R * (√3/2 * q + √3 * r)`
- Six-directional neighbor system for grid traversal

**Layout Generation Approach:**
- Starts with seed hex at origin (0,0)
- Grows patterns using scored candidate selection
- Balances aspect ratio adherence vs. compactness
- Optional tendrils extend from perimeter for dynamic aesthetics

**Color Strategies:**
- **Random**: Simple shuffled distribution
- **Gradient**: Directional color flow along chosen axis
- **Scheme60**: Interior design 60-30-10 rule implementation

### Key Dependencies

- **Streamlit**: Web UI framework
- **streamlit-drawable-canvas**: Interactive canvas for overlay manipulation  
- **NumPy**: Mathematical operations and random number generation
- **Matplotlib**: Plotting and image generation
- **PIL (Pillow)**: Image processing and format conversion

### Session State Management

Critical session state keys:
- `pattern_objects`: Stores generated layouts with PNG bytes and dimensions
- `overlay_state`: Tracks overlay position and scale (left, top, scaleX, scaleY)
- `uploaded_wall_image_bytes`/`active_wall_image_bytes`: Image state management

### Development Notes

- The core mathematical engine (`hex_tile_layouts_core.py`) is framework-agnostic and can be used independently
- Pattern generation uses probabilistic scoring to balance competing objectives (aspect ratio, compactness, connectivity)
- The overlay system handles coordinate transformations between image pixels and fabric.js canvas coordinates
- Image processing includes automatic resizing (max 800px) for performance optimization

### File Structure Importance

```
app/
  hex_tile_layouts_core.py  # Core mathematical engine
  generators.py             # Alternative generation algorithms  
  hexgrid.py               # Basic hex grid utilities
  tabs/
    generator.py           # Pattern creation UI
    overlay.py             # Wall visualization UI
    about.py               # Documentation tab
streamlit_app.py           # Application entry point and routing
```

The separation between core logic (`hex_tile_layouts_core.py`) and UI (`tabs/`) enables potential framework migration while preserving the mathematical foundation.