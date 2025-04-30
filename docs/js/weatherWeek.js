import { getCurrentData } from "./weatherNow.js";

const apiKey = "CWA-1F09ABED-82CA-4ECA-B66A-66942DA974AB";
const weekUrl = `https://opendata.cwa.gov.tw/api/v1/rest/datastore/F-D0047-091?Authorization=${apiKey}`;
function formatDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
async function getToday(cityName, currentWhat) {
  let todayData = await getCurrentData(cityName);
  return todayData[currentWhat];
}

async function fetchWeek() {
  const res = await fetch(weekUrl);
  const data = await res.json();
  return data.records.Locations[0].Location;
}
export async function getWeekData(cityName) {
  const data = await fetchWeek();
  // console.log("完整資料:", data);
  const cityData = data.find((city) => city.LocationName.includes(cityName));
  if (!cityData) {
    console.log("無此縣市資料");
    return;
  }
  const temperatureArray = cityData.WeatherElement.find(
    (e) => e.ElementName === "平均溫度"
  ).Time;
  const descriptionArray = cityData.WeatherElement.find(
    (e) => e.ElementName === "天氣預報綜合描述"
  ).Time;
  // console.log("天氣陣列", temperatureArray);
  const weekTemperatures = [];
  const weekDescriptions = [];
  const now = new Date();
  const afterSevenDay = new Date(now);
  afterSevenDay.setDate(new Date().getDate() + 7);

  for (const item of temperatureArray) {
    const itemTime = new Date(item.StartTime);
    if (
      formatDate(itemTime) > formatDate(now) &&
      formatDate(itemTime) < formatDate(afterSevenDay)
    ) {
      if (itemTime.getHours() === 6) {
        weekTemperatures.push(item.ElementValue[0].Temperature);
      }
    }
  }
  const todayTemperature = await getToday(cityName, "currentTemperature");
  weekTemperatures.unshift(todayTemperature);
  console.log("一週天氣陣列:", weekTemperatures);
  for (const item of descriptionArray) {
    const itemTime = new Date(item.StartTime);
    if (
      formatDate(itemTime) > formatDate(now) &&
      formatDate(itemTime) < formatDate(afterSevenDay)
    ) {
      if (itemTime.getHours() === 6) {
        weekDescriptions.push(
          item.ElementValue[0].WeatherDescription.split("。")[0]
        );
      }
    }
  }
  const todayDescription = await getToday(cityName, "currentDescription");
  weekDescriptions.unshift(todayDescription);
  console.log("一周天氣描述陣列", weekDescriptions);
  return { weekTemperatures, weekDescriptions };
}
