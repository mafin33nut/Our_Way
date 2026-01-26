# RPG Self-Improvement Web App - Frontend

This is a React + TypeScript + Vite frontend application using Bun as the runtime.

## Prerequisites

- [Bun](https://bun.sh) installed (v1.3.1 or later)

## Setup

To install dependencies:

```bash
bun install
```

## Development

To start the development server:

```bash
bun dev
```

The app will be available at `http://localhost:5173`

**Important:** You must run the dev server - you cannot just open `index.html` directly in a browser. The Vite dev server is required to bundle and serve the React application.

## Production Build

To build for production:

```bash
bun run build
```

The built files will be in the `dist/` directory.

To preview the production build:

```bash
bun run preview
```

## Docker

If using Docker Compose, the frontend service will automatically start the dev server:

```bash
docker-compose up frontend
```

This project was created using `bun init` in bun v1.3.1. [Bun](https://bun.com) is a fast all-in-one JavaScript runtime.
