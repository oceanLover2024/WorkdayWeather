let url = "https://workdayweather.onrender.com";
export function connect(onNewMessage, onClearMessages, onError) {
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
  };

  return source;
}

export async function postMessage(text) {
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
export async function getMessage() {
  const res = await fetch(`${url}/api/messages`);
  const result = await res.json();
  return result;
}

export async function startChat(renderMessages, renderPostMessage, onClearUI) {
  const result = await getMessage();
  if (result.status === "success") {
    renderMessages(result.data);
  } else {
    console.log("歷史留言載入失敗:", result.message);
  }

  connect(
    (msg) => renderPostMessage(msg),
    () => onClearUI(),
    (err) => console.log("SSE 斷線錯誤:", err)
  );
}

export async function handleSubmit(text) {
  const result = await postMessage(text);
  if (result.status !== "success") {
    console.log("留言送出失敗:", result.message);
  }
  return result;
}
