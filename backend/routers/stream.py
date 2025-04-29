from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from services.message_service import message_stream

router = APIRouter(prefix="/api", tags=["Stream"])

@router.get("/stream")
async def stream_messages():
    return StreamingResponse(message_stream(), media_type = "text/event-stream")