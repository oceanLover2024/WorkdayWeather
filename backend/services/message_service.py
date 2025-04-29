from collections import deque
import asyncio
from datetime import datetime
from zoneinfo import ZoneInfo
import json

messages: deque = deque(maxlen=50)
lock = asyncio.Lock()
observers = [] 
TAIPEI_TZ = ZoneInfo("Asia/Taipei")
current_date = datetime.now(TAIPEI_TZ).date()
background_task = None 


async def save_message(text: str):
    formatted_time = datetime.now(TAIPEI_TZ).strftime("%Y/%m/%d %H:%M:%S")
    msg = {
            "text": text,
            "time": formatted_time
        }
    async with lock:
        messages.append(msg)
        for observer in observers[:]:
            try:
                await observer({"event": "new_message", "data": json.dumps(msg)})
            except Exception as err:
                print(f"推播失敗：{err}")
                continue
    return msg


async def get_messages():
    async with lock:
        return list(messages)
    

async def check_messages():
    global messages, current_date
    today = datetime.now(TAIPEI_TZ).date()
    if today != current_date:
        async with lock:
            messages.clear()
            current_date = today
            for observer in observers[:]:
                try:
                    await observer({"event": "clear_message", "data": json.dumps({})})
                except Exception as err:
                    print(f"跨日訊息清除失敗：{err}")
                    continue


async def message_stream():
    queue = asyncio.Queue()
    observer = queue.put
    observers.append(observer)
    print(f"觀看者已添加，目前數量: {len(observers)}") 
    try:
        while True:
            event = await queue.get()
            yield {
                "event": event["event"],
                "data": event["data"]


            }
    except Exception as err:
        print(f"串流出現錯誤：{err}")
    finally:
        try:
            observers.remove(observer)
        except ValueError as e:
            print(f"觀看者移除出現錯誤：{e}")

def start_clear_messages_task():
    global background_task
    background_task = asyncio.create_task(clear_messages_daily())


async def stop_clear_messages_task():
    global background_task
    if background_task and not background_task.done():
        background_task.cancel()
        try:
            await background_task
        except asyncio.CancelledError: # 不是典型錯誤
            print("背景任務已成功停止") 
        except Exception as e:
            print(f"停止背景任務時，發生意外錯誤: {e}") 
    else:
        print("背景任務無需停止 (可能未啟動或已完成)。") 


async def clear_messages_daily():
    while True:
        try:
            await check_messages()
            await asyncio.sleep(300)
        except asyncio.CancelledError:
            print("背景任務已成功停止") 
            raise
        except Exception as e:
            await asyncio.sleep(300)
            print(f"背景任務發生意外錯誤: {e}") 







