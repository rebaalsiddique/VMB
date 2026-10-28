from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

try:
    from routers import scenarios
except ModuleNotFoundError:  # pragma: no cover - supports imported usage from project root
    from backend.routers import scenarios

app = FastAPI(
    title="Virtual Mining Blast Lab API",
    description="API for managing simulation scenarios and running mining blast simulations.",
    version="1.0.0",
)

# CORS config for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Virtual Mining Blast Lab API is running. Scaffolded backend prototype."}

# Mount routers when ready
app.include_router(scenarios.router, prefix="/api/v1/scenarios", tags=["Scenarios"])

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
