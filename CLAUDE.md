# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Structure

This is a React + TypeScript frontend application built with Vite, using TanStack Router for navigation and TailwindCSS for styling. The project follows a monorepo structure with:

- `front/` - Main React application
- Root `package.json` - Contains axios dependency (likely for shared API utilities)

## Key Technologies

- **React 19** with TypeScript
- **TanStack Router** - File-based routing with type safety
- **Vite** - Build tool and dev server
- **TailwindCSS** - Styling framework
- **React Hook Form** with Zod validation
- **Axios** - HTTP client with interceptors
- **ESLint** - Linting with TypeScript and React rules

## Development Commands

Navigate to the `front/` directory for all development tasks:

```bash
cd front/

# Development server
npm run dev

# Build for production
npm run build

# Lint code
npm run lint

# Preview production build
npm run preview
```

## Application Architecture

### Routing
Uses TanStack Router with file-based routing in `src/routes/`. The router is configured with:
- Auto-generated route tree (`routeTree.gen.ts`)
- Type-safe navigation
- Development tools integration

### API Configuration
Centralized API client in `src/lib/api.ts` with:
- Automatic token injection from localStorage
- Development proxy to `http://127.0.0.1:8000/api`
- Production API URL from `VITE_API_URL` environment variable
- Built-in error handling for 404s and authentication

### UI Components
Organized component structure:
- `src/components/layouts/` - Layout components
- `src/components/form/` - Form input components
- `src/components/ui/` - Reusable UI elements
- `src/components/cadastros/` - Domain-specific components

### State Management
Uses React Hook Form with Zod validation schemas for form state management.

### Styling
TailwindCSS with custom CSS variables defined in `src/index.css` for theming.

## Development Guidelines

### Backend Integration
- API calls should use the configured `api` client from `src/lib/api.ts`
- Development server proxies `/api/*` requests to `http://127.0.0.1:8000`
- Authentication tokens are automatically added to requests

### Component Development
- Follow existing component patterns in the codebase
- Use TypeScript for all new components
- Leverage React Hook Form for form handling
- Use Zod for form validation schemas

### Build Process
The build process includes:
1. TypeScript compilation (`tsc -b`)
2. Vite bundling
3. ESLint validation

Always run `npm run build` to ensure code compiles successfully before committing.