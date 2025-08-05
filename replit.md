# Pomodoro Productivity App

## Overview

This is a React-based productivity application that combines a Pomodoro timer with task management. The app helps users track their work sessions and manage their to-do lists with a modern, responsive interface. It features a drag-and-drop task board, dynamic motivational content that switches between inspirational quotes and workout routines based on timer state, and real-time productivity statistics tracking.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The frontend uses React with TypeScript, built with Vite for fast development and bundling. The component structure follows a modern React pattern with functional components and hooks. The UI is built using shadcn/ui components (Radix UI primitives) with Tailwind CSS for styling. State management is handled through React Query for server state and custom hooks for local state like the timer functionality.

### Routing and Navigation
The application uses Wouter for lightweight client-side routing. Currently implements a simple structure with a home page and 404 handling, designed for easy expansion.

### Backend Architecture
The backend is built with Express.js and follows a REST API pattern. It implements a modular route structure with separate concerns for different features (todos, timer sessions). The storage layer uses an abstraction pattern with an in-memory implementation that can be easily swapped for database persistence.

### Data Layer
The schema is defined using Drizzle ORM with PostgreSQL as the target database. The schema includes tables for todos and timer sessions with proper relationships. Zod is used for runtime validation of API inputs and outputs, ensuring type safety across the full stack.

### UI Component System
The app uses a comprehensive design system based on shadcn/ui, providing consistent styling and behavior. Components are built with accessibility in mind using Radix UI primitives. The design supports both light and dark themes with CSS custom properties.

### Timer System
The Pomodoro timer is implemented with a custom React hook that manages work/break cycles, tracks completed sessions, and integrates with the task management system. Timer sessions are persisted to track productivity metrics. The timer state controls the dynamic content display at the top of the page.

### Task Management
Tasks follow a Kanban-style board with three states: todo, working, and completed. The system supports drag-and-drop functionality for moving tasks between states, priority levels, and time tracking integration. The task input form is responsive and mobile-friendly with full-width text fields.

### Motivational Content System
Dynamic content display at the top of the page that switches based on timer state:
- Default state (timer not running): Quick exercise routines
- Timer running (work session): Inspirational quotes with nature imagery
- Break time: Targeted workout routines for desk-based workers

### Productivity Statistics
Real-time statistics showing actual task completion data instead of mock data, with proper zero states when no tasks exist. Tracks daily progress, focus sessions, and completion rates.

## External Dependencies

### Database
- **PostgreSQL**: Primary database using Neon serverless PostgreSQL
- **Drizzle ORM**: Type-safe database toolkit for schema definition and queries
- **Drizzle Kit**: Database migration and introspection tools

### UI and Styling
- **Tailwind CSS**: Utility-first CSS framework for styling
- **Radix UI**: Unstyled, accessible UI primitives
- **shadcn/ui**: Pre-built component library based on Radix UI
- **Lucide React**: Icon library for consistent iconography

### State Management and Data Fetching
- **TanStack React Query**: Server state management and caching
- **React Hook Form**: Form state management and validation
- **Zod**: Schema validation for TypeScript

### Development Tools
- **Vite**: Build tool and development server
- **TypeScript**: Type safety and development experience
- **ESBuild**: Fast JavaScript bundler for production builds

### Third-party Integrations
- **Unsplash API**: Motivational images during break periods
- **External Quotes API**: Inspirational quotes for motivation content

### Utilities
- **date-fns**: Date manipulation and formatting
- **class-variance-authority**: Utility for managing CSS class variants
- **clsx**: Conditional class name utility
- **nanoid**: Unique ID generation