# How to Run the Frontend Without Docker

## Quick Start

1. **Install dependencies:**
   ```bash
   cd frontend
   bun install
   ```

2. **Start the development server:**
   ```bash
   bun dev
   ```

3. **Open your browser:**
   Navigate to `http://localhost:5173`

## If You Need the Backend Too

If you need to run the backend as well, you have a few options:

### Option A: Run Backend with Docker (if you have Docker)
```bash
# From project root
docker compose up db backend
# Or if that doesn't work:
docker-compose up db backend
```

### Option B: Run Backend Locally (if you have Python)
```bash
cd backend
# Install Python dependencies (you'll need to check your requirements.txt)
pip install -r requirements.txt
# Run Django server
python manage.py runserver
```

### Option C: Update Vite Config for Local Backend

If running backend locally on port 8000, make sure your `vite.config.ts` proxy points to `localhost:8000` instead of `backend:8000`.
