# Hex Layout Toolkit - Backend

FastAPI backend for the Hex Layout Toolkit v2.0

## Development Setup

```bash
# Install dependencies
uv pip install -r requirements.txt

# Run development server
uvicorn src.main:app --reload --port 8000

# Run tests
pytest tests/ -v
```