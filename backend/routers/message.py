from fastapi import APIRouter, status
from fastapi.responses import JSONResponse
from models import Message
from services.message_service import check_messages, save_message, get_messages

router = APIRouter(prefix="/api", tags=["Message"])


@router.post("/message")
async def add_message(message: Message):
    text = message.text.strip()
    if not text:
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={
                "status": "error",
                "data": None,
                "message": "資料載入錯誤，請重新輸入訊息",
            },
        )
    if len(text) > 100:
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={
                "status": "error",
                "data": None,
                "message": "字數不得超過一百字",
            },
        )
    try:
        result = await save_message(text)
        return {"status": "success", "data": result}
    except Exception as err:
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "status": "error",
                "data": None,
                "message": f"伺服器錯誤: {str(err)}"
            },
        )



@router.get("/messages")
async def get_all_messages():
    try:
        result = await get_messages()
        return {"status": "success", "data": result}
    except Exception as err:
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "status": "error",
                "data": None,
                "message": f"伺服器錯誤: {str(err)}"
            },
        )

