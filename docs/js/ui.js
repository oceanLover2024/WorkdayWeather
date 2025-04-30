import { getCurrentData } from "./weatherNow.js";
import { getWeekData } from "./weatherWeek.js";
import { startChat, handleSubmit } from "./chat.js";

// 取得預設資訊
document.addEventListener("DOMContentLoaded", async () => {
  const defaultCity = "臺北市";

  try {
    const weatherData = await getCurrentData(defaultCity);
    renderWeatherInfo(defaultCity, weatherData);
    renderWeatherNotice(weatherData.currentDescription);

    if (
        weatherData.currentDescription.includes("雷") &&
        weatherData.currentDescription.includes("雨")
    ) {
        animate();
    }
  } catch (error) {
    console.error(error);
    weatherInfo.innerHTML = "<p>載入失敗，請稍後再試。</p>";
    workdayNotice.innerHTML = "<p>載入失敗，請稍後再試。</p>";
  }

  try {
    const weekData = await getWeekData(defaultCity);
    renderWeeklyWeather(weekData.weekTemperatures, weekData.weekDescriptions);
  } catch (error) {
    console.error(error);
    container.innerHTML = "<p>載入失敗，請稍後再試。</p>";
  } 
});

// 出門提醒
const workdayNotice = document.querySelector(".work-notice_content")
function renderWeatherNotice(description){
    let emoji = "😎";
    let message = "記得防曬和補充水分！";

    if (description.includes("雷")) {
        emoji = "😵‍💫";
        message = "出門記得帶傘，小心雷雨！";
    } else if (description.includes("雨")) {
        emoji = "☔️";
        message = "別忘了帶傘，避免淋濕喔";
    } else if (description.includes("晴")) {
        emoji = "😎";
        message = "記得防曬和補充水分！";
    } else if (description.includes("陰")) {
        emoji = "🤩";
        message = "天氣陰沉，保持好心情！";
    } else if (description.includes("雲")) {
        emoji = "🥳";
        message = "雲多但舒適，今天也要加油～";
    }

    workdayNotice.innerHTML = `
        <p style="font-size:45px">${emoji}</p>
        <div>
        <p style="margin: 0 0 8px 10px;">目前天氣：${description}</p>
        <p style="background: #A9E4AB; padding: 5px 10px; border-radius: 200px; font-weight: 600">${message}</p>
        </div>
    `;
}

// 取得API即時氣象資訊
const paths = document.querySelectorAll("#map a");
const weatherInfo = document.getElementById("weather-info");

paths.forEach((path) => {
  path.addEventListener("click", async (e) => {
    const cityName = path.getAttribute("id");

    try {
      const weatherData = await getCurrentData(cityName);
      renderWeatherInfo(cityName, weatherData);
    } catch (error) {
      console.error(error);
      weatherInfo.innerHTML = "<p>載入失敗，請稍後再試。</p>";
    }
  });
});

function getCurrentFormattedDate() {
  const now = new Date();
  const days = [
    "星期日",
    "星期一",
    "星期二",
    "星期三",
    "星期四",
    "星期五",
    "星期六",
  ];
  const day = days[now.getDay()]; // 星期幾

  const month = String(now.getMonth() + 1).padStart(2, "0"); // 月份
  const date = String(now.getDate()).padStart(2, "0"); // 日期

  return `${day} , ${month}/${date}`;
}

// 渲染即時資訊
function renderWeatherInfo(cityName, weatherData) {
  const iconUrl = getWeatherIcon(weatherData.weather);
  const currentDatetime = getCurrentFormattedDate();
  const {
    currentDescription,
    currentTemperature,
    currentRain,
    currentHumidity,
  } = weatherData;

  weatherInfo.innerHTML = `
      <div class="city-title">
        <h2>${cityName}</h2>
        <p>${currentDatetime}</p>
      </div>
      <div class="city-status">
        <img src="${iconUrl}" alt="${currentDescription}" style="width: 150px;" >    
        <p>${currentTemperature} °C</p>  
      </div>
      <div style="display: flex; justify-content: space-around;">
        <p style="font-size: 20px">🌧️ 降雨率：${currentRain} %</p>
        <p style="font-size: 20px">💧 濕度：${currentHumidity} %</p>
      </div>
    `;
}

// 即時天氣圖示
function getWeatherIcon(weatherDescription) {
  if (typeof weather !== "string") return "./images/sunny.svg";

  if (weatherDescription.includes("雷")) {
    return "./images/thunderstorm.svg";
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
    container.innerHTML = "";
  
    const now = new Date();
    const weekdayMap = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
  
    const promises = [];
  
    for (let i = 1; i <= 7; i++) {
      const futureDate = new Date(now);
      futureDate.setDate(now.getDate() + i);
      const weekday = weekdayMap[futureDate.getDay()];
      const temperature = weekTemperatures[i - 1] || "—";
      const description = weekDescriptions[i - 1] || "—";
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
  
    //照順序插入
    Promise.all(promises).then((results) => {
      results.forEach(({ svgText, weekday, temperature, iconSrc }) => {
        const item = document.createElement("div");
        item.className = "weekly-weather_item";
        item.innerHTML = `
          <div>${svgText}</div>
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
    ["多雲時陰短暫陣雨或雷雨", "陰短暫陣雨或雷雨"].includes(description)
  ) {
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
    msgDiv.innerHTML = `${msg.time}<br><span style="font-size: 18px; font-weight: 600;">${msg.text}</span>`;
    msgDiv.classList.add(getRandomColorClass());
    msgDiv.classList.add("msg");
    chatSection.appendChild(msgDiv);
  });
}
// 隨機訊息背景色
function getRandomColorClass() {
  const classes = ["bg-red", "bg-green", "bg-blue"];
  const index = Math.floor(Math.random() * classes.length);
  return classes[index];
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
  msgDiv.innerHTML = `${msg.time}<br><span style="font-size: 18px; font-weight: 600;">${safeText}</span>`;
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
  if (!text || text.length > 100) {
    alert("不可超過100字")
    return
}

  await handleSubmit(text);
  input.value = "";
});

// 按 Enter 也可以送出
input.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    button.click();
  }
});

startChat(renderMessages, renderPostMessage, onClearUI);



const canvas = document.getElementById("background-canvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

window.addEventListener("resize", () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});

//雨滴設定
const raindrops = Array.from({ length: 30 }, () => ({
  x: Math.random() * canvas.width,
  y: Math.random() * canvas.height,
  dy: 2 + Math.random() * 2
}));

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = "rgba(95, 185, 215, 0.5)";
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
  requestAnimationFrame(animate);
}
