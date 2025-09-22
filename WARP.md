# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

The Hex Layout Toolkit is a Streamlit web application for designing and visualizing custom hexagonal tile layouts for acoustic panels, decorative walls, and other interior design applications. It features sophisticated mathematical algorithms for generating aspect-aware hexagonal patterns with customizable color schemes and interactive visualization capabilities.

## Development Environment Setup

**Prerequisites:**
- Python 3.12+
- [uv](https://github.com/astral-sh/uv) package manager

**Setup Commands:**
```bash
# Create and activate virtual environment
uv venv
source .venv/bin/activate  # macOS/Linux

# Install dependencies
uv pip sync requirements.txt

# Run the application
streamlit run streamlit_app.py
```

**Alternative direct run:**
```bash
python main.py  # Simple "Hello" script for testing
```

## Architecture Overview

The application follows a modular, separation-of-concerns architecture:

### Core Components

1. **`streamlit_app.py`** - Main entry point and navigation shell
   - Handles session state initialization
   - Manages tab navigation between Generator, Overlay, and About views
   - Maintains pattern_objects storage and overlay_state management

2. **`app/hex_tile_layouts_core.py`** - Mathematical engine (Streamlit-agnostic)
   - Hexagonal grid mathematics using axial coordinates
   - Layout generation algorithms with aspect-aware blob growth
   - Advanced color assignment strategies (random, gradient, scheme60)
   - Rendering utilities for matplotlib and PNG generation
   - Core data structures: `Hex`, `LayoutParams`

3. **`app/tabs/`** - Modular UI components
   - `generator.py` - Pattern creation interface with extensive parameter controls
   - `overlay.py` - Interactive wall visualization using streamlit-drawable-canvas
   - `about.py` - Documentation and help content

### Key Algorithms

The core mathematical engine implements several sophisticated algorithms:

- **Aspect-Aware Growth**: Uses scoring functions that balance aspect ratio adherence with compactness
- **Tendril Generation**: Adds organic extensions to base blob shapes while maintaining target aspect ratios
- **Color Strategies**: 
  - Gradient: Uses principal component analysis for directional color flow
  - Scheme60: Implements interior design 60-30-10 rule with zone-based assignment
- **Hex Grid Math**: Pointy-topped axial coordinate system with neighbor traversal

## Development Patterns

### Session State Management
The application relies heavily on Streamlit session state for:
- `pattern_objects`: Dictionary storing generated layouts with metadata
- `overlay_state`: Transform parameters for interactive overlay positioning
- `uploaded_wall_image_bytes` and `active_wall_image_bytes`: Image data management

### Mathematical Precision
- All hexagonal calculations use axial coordinates (q, r) with pointy-top orientation
- Aspect ratio calculations include full tile bounding boxes with padding
- Color assignment uses numpy random generators for reproducible results

### UI Component Structure
Each tab module follows the pattern:
```python
def render():
    with st.sidebar:
        # Controls and parameters
    
    # Main content area
    # Processing and display logic
```

## Testing and Debugging

**Visual Testing:**
```bash
# Test different seeds and parameters
streamlit run streamlit_app.py
# Navigate to Generator tab and experiment with:
# - Different aspect ratios (1:1, 16:9, 4:3)
# - Various color strategies
# - Tendril configurations
```

**Mathematical Validation:**
- Aspect ratio calculations can be verified by checking the bounding box dimensions
- Color distribution can be validated by counting assigned colors vs. target counts
- Hex positioning uses standard axial-to-pixel conversion formulas

## Common Development Tasks

### Adding New Color Strategies
1. Implement assignment function in `hex_tile_layouts_core.py` following pattern:
   ```python
   def assign_colors_newstrategy(hexes, rng, params) -> List[str]:
       # Implementation
   ```
2. Add option to color_mode selectbox in `generator.py`
3. Update the strategy dispatch in `generate_layout()`

### Modifying Layout Generation
- Core growth algorithm is in `grow_blob()` and `add_tendrils()`
- Scoring function in `candidate_score()` balances multiple objectives
- Aspect tolerance and adherence parameters control shape strictness

### Extending UI Functionality
- Session state keys must be initialized in `streamlit_app.py`
- Interactive components should use consistent key naming: `{tab}_{parameter}`
- Canvas-based interactions require fabric.js object structure

## File Structure Notes

- `requirements.txt` contains production dependencies
- `pyproject.toml` defines project metadata but uv uses requirements.txt for installation
- No build artifacts or compiled components
- Static assets limited to `layout.jpg` reference image

## Performance Considerations

- Image resizing automatically limits uploaded images to 800px max dimension
- Pattern generation uses efficient numpy operations for mathematical computations
- Matplotlib figures are explicitly closed to prevent memory leaks
- Session state pattern_objects can accumulate; consider cleanup for long sessions

## Spec-Kit Integration

This project uses spec-kit for specification-driven development. The following commands are available:

### Core Commands
- `/specify <description>` - Create feature specification (handled by Claude)
- `/check` - Check prerequisites and documentation status
- `/plan` - Create implementation plan from specification
- `/tasks` - Generate executable task list from plan
- `/status` - Show project status and active specifications
- `/new-feature <name>` - Create new feature branch and directory

### Command Recognition
Warp should recognize these commands in the command palette. If they don't appear:
1. Restart Warp
2. Check that `.specify/` directory exists with templates
3. Ensure `.warp-commands.json` is present in project root

### Project Structure
```
specs/
├── 001-feature-name/
│   ├── spec.md          # Feature specification
│   ├── plan.md          # Implementation plan
│   ├── tasks.md         # Executable tasks
│   ├── research.md      # Research findings
│   ├── data-model.md    # Data structures
│   └── contracts/       # API contracts
└── ...
```

### Environment Variables
- `SPECIFY_FEATURE` - Override current feature branch detection
- Set to branch name like `001-feature-name` for non-git workflows
