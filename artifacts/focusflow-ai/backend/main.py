from fastapi import FastAPI

app = FastAPI(title="FocusFlow AI API")


@app.get("/focusflow-api/healthz")
async def health_check() -> dict[str, str]:
    return {"status": "ok"}
