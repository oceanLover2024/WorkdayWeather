let url = "";
function connect(onNewMessage, onClearMessages, onError) {
  const source = new EventSource(`${url}/api/stream`);
  source.addEventListener("new_message", (e) => {
    const msg = JSON.parse(e.data);
    onNewMessage(msg);
  });
  source.addEventListener("clear_messages", (e) => {
    onClearMessages();
  });
  source.onerror = (err) => {
    console.error("SSE錯誤:", err);
    if (onError) onError(err);
    source.close();
  };

  return source;
}

async function postMessage(text) {
  const res = await fetch(`${url}/api/message`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      text: text,
    }),
  });
  const result = await res.json();
  return result;
}
async function getMessage() {
  const res = await fetch(`${url}/api/messages`);
  const result = await res.json();
  return result;
}
//------------------------------------
async function startChat(renderMessages, renderPostMessage, onClearUI) {
  // 1. 載入歷史訊息
  const result = await getMessage();
  if (result.status === "success") {
    renderMessages(result.data); // 假設渲染的函數是renderMessages
  } else {
    console.log("歷史留言載入失敗:", result.message);
  }

  // 2. 開啟 SSE 監聽
  connect(
    (msg) => renderPostMessage(msg), //假設渲染的函數是renderPostMessage
    () => onClearUI(), //假設渲染的函數是onClearUI
    (err) => console.log("SSE 斷線錯誤:", err)
  );
}

// 使用者送出訊息時觸發
async function handleSubmit(text) {
  const result = await postMessage(text);
  if (result.status !== "success") {
    console.log("留言送出失敗:", result.message);
  }
}
