const apiKey = "CWA-1F09ABED-82CA-4ECA-B66A-66942DA974AB";
const weekUrl = `https://opendata.cwa.gov.tw/api/v1/rest/datastore/F-D0047-091?Authorization=${apiKey}`;
async function fetchWeek() {
  const res = await fetch(weekUrl);
  const data = await res.json();
  return data.records.Locations[0].Location;
}
export async function getWeekData(cityName) {
  const data = await fetchWeek();
  //console.log("完整資料:", data);
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

  const weekTemperatures = [];
  const weekDescriptions = [];
  for (const item of temperatureArray) {
    const startHour = new Date(item.StartTime).getHours();
    if (startHour === 6) {
      weekTemperatures.push(item.ElementValue[0].Temperature);
    }
  }
  //console.log("一週天氣陣列:", weekTemperatures);
  for (const item of descriptionArray) {
    const startHour = new Date(item.StartTime).getHours();
    if (startHour === 6) {
      weekDescriptions.push(
        item.ElementValue[0].WeatherDescription.split("。")[0]
      );
    }
  }
  //console.log("一周天氣描述陣列", weekDescriptions);
  return { weekTemperatures, weekDescriptions };
}

//async function test() {
// let answer = await getWeekData("臺北市");
// console.log("answer:", answer);
//}
//test();
