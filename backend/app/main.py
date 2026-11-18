from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .api.routes import router
from .config import settings

app = FastAPI(title="Pokemon GO Quest Finder API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=list(settings.allowed_origins),
    allow_methods=["GET"],
    allow_headers=["*"],
)
app.include_router(router)
