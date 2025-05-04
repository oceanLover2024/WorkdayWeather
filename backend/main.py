from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from routers import message, stream
from services.message_service import start_clear_messages_task, stop_clear_messages_task

@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        start_clear_messages_task()
        yield
    finally:
        await stop_clear_messages_task()


app = FastAPI(lifespan=lifespan)
app.include_router(message.router)
app.include_router(stream.router)

origins=["https://addfish904.github.io","https://ayating.github.io","https://oceanlover2024.github.io"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host= "0.0.0.0", port= 8000)