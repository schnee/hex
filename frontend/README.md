# Hex Layout Toolkit - React Frontend

Modern React 18 frontend for the Hex Layout Toolkit, built with TypeScript, Vite, and comprehensive testing.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

## 🛠️ Tech Stack

- **React 18.2.0** - Modern React with concurrent features
- **TypeScript 5.2.2** - Type-safe development
- **Vite 4.5.0** - Lightning-fast build tool and dev server
- **Vitest 0.34.6** - Testing framework with Vite integration
- **Testing Library** - React component testing utilities

## 📁 Project Structure

```
src/
├── components/     # Reusable React components
├── context/        # React Context providers
├── hooks/          # Custom React hooks
├── pages/          # Page components
├── services/       # API client and external services
├── types/          # TypeScript type definitions
├── utils/          # Utility functions
├── App.tsx         # Main application component
├── main.tsx        # React application entry point
└── index.css       # Global styles
```

## 🔌 Backend Integration

The frontend connects to a FastAPI backend running on `http://localhost:8000`.

**Available API Endpoints:**
- `POST /api/patterns/generate` - Generate hex tile patterns
- `GET /api/patterns/{id}/download` - Download pattern as PNG
- `POST /api/images/upload` - Upload and process images
- `POST /api/overlay/calculate` - Calculate overlay dimensions
- `GET /api/health` - Health check

## 🧪 Testing

```bash
# Run tests in watch mode
npm test

# Run tests with UI
npm run test:ui

# Generate coverage report
npm test -- --coverage
```

## 📏 Code Quality

```bash
# Lint TypeScript and React code
npm run lint

# Auto-fix linting issues
npm run lint:fix

# Format code with Prettier
npm run format
```

## 🌍 Environment Variables

Create a `.env.local` file for local development:

```
VITE_API_BASE_URL=http://localhost:8000
```

## 🎯 Development Status

- ✅ **T002**: Frontend project structure complete
- 🚧 **Next**: Component development and API integration

## 📦 Key Dependencies

**Runtime:**
- `react` & `react-dom` - React framework
- `react-draggable` - Drag and drop functionality
- `react-resizable` - Resizable components

**Development:**
- `@vitejs/plugin-react` - Vite React integration
- `eslint` & `@typescript-eslint/*` - Code linting
- `prettier` - Code formatting
- `@testing-library/*` - Component testing
- `jsdom` - DOM testing environment

## 🔗 Related

- [Backend API Documentation](../backend/README.md)
- [Project Tasks](../specs/001-streamlit-to-react/tasks.md)