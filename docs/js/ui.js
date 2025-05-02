import { getCurrentData } from "./weatherNow.js";
import { getWeekData } from "./weatherWeek.js";
import { startChat, handleSubmit } from "./chat.js";

// 取得預設資訊
document.addEventListener("DOMContentLoaded", async () => {
  const defaultCity = "臺北市";
  renderRandomJokeNotice()

  try {
    const weatherData = await getCurrentData(defaultCity);
    renderWeatherInfo(defaultCity, weatherData);

  } catch (error) {
    console.error(error);
    weatherInfo.innerHTML = "<p>載入失敗，請稍後再試。</p>";
  }

  try {
    const weekData = await getWeekData(defaultCity);
    renderWeeklyWeather(weekData.weekTemperatures, weekData.weekDescriptions);
  } catch (error) {
    console.error(error);
    container.innerHTML = "<p>載入失敗，請稍後再試。</p>";
  } 
});

// 每日笑話
const workdayNotice = document.querySelector(".work-notice_content")
const jokes = [
  {
    emoji: "🤯",
    question: "Q. 白龍被揍會變成什麼？",
    answer: "A: 青眼白龍",
  },
  {
    emoji: "🐷",
    question: "Q. 豬八戒過馬路會變什麼？",
    answer: "A: 行八戒（行人）",
  },
  {
    emoji: "😵‍💫",
    question: "Q. MySQL真的是我的嗎？",
    answer: "",
  },
  {
    emoji: "🤔",
    question: "Q. 皮卡丘十天不洗澡會有什麼？",
    answer: "A: Pokemon垢",
  },
  {
    emoji: "📚",
    question: "Q. 書店最怕什麼人？",
    answer: "A: 文盲",
  },
  {
    emoji: "🍣",
    question: "Q. 念什麼系適合賣壽司？",
    answer: "A: 美術系",
  },
  {
    emoji: "🇺🇸",
    question: "Q. 開心的川普（猜物品）",
    answer: "A: 樂譜🎼",
  }
];

function renderRandomJokeNotice() {
  const joke = jokes[Math.floor(Math.random() * jokes.length)];

  workdayNotice.innerHTML = `
    <p style="font-size:45px">${joke.emoji}</p>
    <div>
      <p style="font-size: 18px; font-weight:600; margin-bottom: 10px;">${joke.question}</p>
      ${joke.answer ? `<p>${joke.answer}</p>` : ""}
    </div>
  `;
}


// 取得API即時氣象資訊
const paths = document.querySelectorAll(".map path");
const weatherInfo = document.getElementById("weather-info");

paths.forEach((path) => {
  path.addEventListener("click", async (e) => {
    const cityName = path.getAttribute("id");

    try {
      const weatherData = await getCurrentData(cityName);
      renderWeatherInfo(cityName, weatherData);

      const weekData = await getWeekData(cityName);
      renderWeeklyWeather(weekData.weekTemperatures, weekData.weekDescriptions);
    } catch (error) {
      console.error(error);
      weatherInfo.innerHTML = "<p>載入失敗，請稍後再試。</p>";
    }
  });
});

function getCurrentFormattedDate() {
  const now = new Date();
  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const day = days[now.getDay()];
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const date = String(now.getDate()).padStart(2, "0");

  return `${day} ｜ ${month}.${date}`;
}

// 渲染即時資訊
function renderWeatherInfo(cityName, weatherData) {
  const {
    currentDescription,
    currentTemperature,
    currentRain,
    currentHumidity
  } = weatherData;
  const iconUrl = getWeatherIcon(currentDescription);
  const currentDatetime = getCurrentFormattedDate();

  if (currentDescription.includes("雷") || currentDescription.includes("雨")){
    startRain();
  }else{
    stopRain();
  }

  weatherInfo.innerHTML = `
    <div class="fade-in">
      <div class="city-title">
        <h2>${cityName}</h2>
        <p>${currentDatetime}</p>
      </div>
      <div class="city-status">
        <img src="${iconUrl}" alt="${currentDescription}" style="width: 110px;" >    
        <p>${currentTemperature} °C</p>  
      </div>
      <div class="city-info-container">      
        <p class="city-info">🌧️ 降雨率： <span style="font-family: 'Poppins';">${currentRain} %<span/></p>
        <p class="city-info">💧 濕度：<span style="font-family: 'Poppins';">${currentHumidity} %<span/></p>
      </div>
    </div>
    `;
}

// 即時天氣圖示
function getWeatherIcon(weatherDescription) {
  if (typeof weatherDescription !== "string") return "./images/sunny.svg";
  
  if (weatherDescription.includes("雷")) {
    return "./images/thunderstorm.svg";
  } else if (weatherDescription.includes("雨")) {
    return "./images/rain.png";
  } else if (weatherDescription.includes("晴")) {
    return "./images/sunny.svg";
  } else if (weatherDescription.includes("雲")) {
    return "./images/partly-cloudy.svg";
  } else if (weatherDescription.includes("陰")) {
    return "./images/cloudy.svg";
  } else {
    return "./images/sunny.svg";
  }
}

// 一週氣象
function renderWeeklyWeather(weekTemperatures, weekDescriptions) {
    const container = document.querySelector(".weekly-weather_container");
    container.innerHTML = ""
  
    const now = new Date();
    const weekdayMap = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
  
    const promises = [];
  
    for (let i = 0; i < 7; i++) {
      const futureDate = new Date(now);
      futureDate.setDate(now.getDate() + i);
      const weekday = weekdayMap[futureDate.getDay()];
      const temperature = weekTemperatures[i] || "—";
      const description = weekDescriptions[i] || "—";
      const iconSrc = getWeekWeatherIcon(description);
  
      const promise = fetch(iconSrc)
        .then((res) => res.text())
        .then((svgText) => ({
          svgText,
          weekday,
          temperature,
          iconSrc,
        }))
        .catch((error) => {
          console.error("載入 SVG 錯誤：", error);
          return {
            svgText: "<svg></svg>",
            weekday,
            temperature,
            iconSrc,
          };
        });
  
      promises.push(promise);
    }

    Promise.all(promises).then((results) => {
      results.forEach(({ svgText, weekday, temperature, iconSrc }) => {
        const item = document.createElement("div");
        item.className = "weekly-weather_item";
        item.classList.add("fade-in");
        item.innerHTML = `
          <div class="weather-svg">${svgText}</div>
          <p class="weekly-text">${weekday}</p>
          <p class="weekly-text">${temperature}°C</p>
        `;
  
        container.appendChild(item);
  
        const svg = item.querySelector("svg");
        if (svg) {
          const path = svg.querySelector("path");
          const texts = item.querySelectorAll(".weekly-text");
  
          item.addEventListener("mouseenter", () => {
            if (iconSrc === "./images/week-Partly-cloudy.svg") {
              path?.setAttribute("fill", "#F5BD52");
              texts.forEach((text) => (text.style.color = "#F5BD52"));
            } else if (
              iconSrc === "./images/week-Rain&Sun.svg" ||
              iconSrc === "./images/week-Rain&Thunderstorm.svg"
            ) {
              path?.setAttribute("fill", "#95B6F6");
              texts.forEach((text) => (text.style.color = "#95B6F6"));
            } else {
              path?.setAttribute("fill", "#333");
              texts.forEach((text) => (text.style.color = "#333"));
            }
          });
  
          item.addEventListener("mouseleave", () => {
            path?.setAttribute("fill", "#333");
            texts.forEach((text) => (text.style.color = "#333"));
          });
        }
      });
    });
  }

function getWeekWeatherIcon(description) {
  if (["多雲時晴", "晴時多雲"].includes(description)) {
    return "./images/week-Partly-cloudy.svg";
  } else if (["陰時多雲短暫陣雨", "多雲短暫陣雨"].includes(description)) {
    return "./images/week-Rain&Sun.svg";
  } else if (
    ["多雲時陰短暫陣雨或雷雨", "陰短暫陣雨或雷雨"].includes(description)) {
    return "./images/week-Rain&Thunderstorm.svg";
  } else {
    return "./images/week-Partly-cloudy.svg";
  }
}

// 聊天室
const chatSection = document.querySelector(".chat-section_room");
const input = document.querySelector(".chat-section_input textarea");
const button = document.querySelector(".chat-section_input button");

function renderMessages(messages) {
  chatSection.innerHTML = "";
  messages.forEach((msg) => {
    const msgDiv = document.createElement("div");
    msgDiv.innerHTML = `<span style="white-space: nowrap;">${msg.time}</span><span style="font-weight: 600;">${msg.text}</span>`;
    msgDiv.classList.add(getRandomColorClass());
    msgDiv.classList.add("msg");
    chatSection.appendChild(msgDiv);
  });
}
// 隨機訊息背景色
function getRandomColorClass() {
  const chatColors = ["bg-red", "bg-green", "bg-blue"];
  const index = Math.floor(Math.random() * chatColors.length);
  return chatColors[index];
}

// 仿止xss
function escapeHTML(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// 渲染一則新訊息
function renderPostMessage(msg) {
  const msgDiv = document.createElement("div");
  const safeText = escapeHTML(msg.text);
  msgDiv.innerHTML = `<span style="white-space: nowrap;">${msg.time}</span><span style="font-weight: 600;">${safeText}</span>`;
  msgDiv.classList.add(getRandomColorClass());
  msgDiv.classList.add("msg");
  chatSection.appendChild(msgDiv);
  chatSection.scrollTop = chatSection.scrollHeight; 
}

// 清空聊天畫面
function onClearUI() {
  chatSection.innerHTML = "";
}

// 處理送出留言
button.addEventListener("click", async () => {
  const text = input.value.trim();
  if (!text){
   return
  } else if(text.length > 100){
    alert("不可超過100字")
    return
  }

  await handleSubmit(text);
  input.value = "";
});

startChat(renderMessages, renderPostMessage, onClearUI);


// 下雨動畫
const canvas = document.getElementById("background-canvas");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

window.addEventListener("resize", () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});

let raindrops = [];
let isRaining = false;
let animationId;

function generateRaindrops(count) {
  return Array.from({ length: count }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    dy: 5
  }));
}

// 啟動雨滴動畫
function startRain() {
  if (isRaining) return;
  isRaining = true;
  raindrops = generateRaindrops(40);
  animate();
}

// 停止雨滴動畫
function stopRain() {
  isRaining = false;
}

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = "rgba(32, 152, 192, 0.5)";
  ctx.lineWidth = 1;

  for (const drop of raindrops) {
    ctx.beginPath();
    ctx.moveTo(drop.x, drop.y);
    ctx.lineTo(drop.x, drop.y + 10);
    ctx.stroke();

    drop.y += drop.dy;
    if (drop.y > canvas.height) {
      drop.y = -10;
      drop.x = Math.random() * canvas.width;
    }
  }

  if (!isRaining && raindrops.length > 0) {
    raindrops.pop();
  }

  animationId = requestAnimationFrame(animate);
}
// startRain()