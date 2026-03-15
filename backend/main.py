from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import predict, stats, stream, upload

app = FastAPI(title="Sentinel IDS API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    # Add "*" to allow all for now, or add your specific Render frontend URL later
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(predict.router, prefix="/api")
app.include_router(stats.router,   prefix="/api")
app.include_router(upload.router,  prefix="/api")
app.include_router(stream.router)


@app.get("/")
def root():
    return {"status": "Sentinel IDS API is running"}