const apiKey = "CWA-1F09ABED-82CA-4ECA-B66A-66942DA974AB";
const nowUrl = `https://opendata.cwa.gov.tw/api/v1/rest/datastore/F-D0047-089?Authorization=${apiKey}`;

async function fetchNow() {
  const res = await fetch(nowUrl);
  const data = await res.json();
  return data.records.Locations[0].Location;
}
async function getCurrentData(cityName) {
  const data = await fetchNow();
  console.log("完整陣列", data);
  const cityData = data.find((city) => city.LocationName.includes(cityName));
  if (!cityData) {
    console.log("無此縣市資料");
    return;
  }
  const temperatureArray = cityData.WeatherElement.find(
    (e) => e.ElementName === "溫度"
  ).Time;
  const humidityArray = cityData.WeatherElement.find(
    (e) => e.ElementName === "相對濕度"
  ).Time;
  const descriptionArray = cityData.WeatherElement.find(
    (e) => e.ElementName === "天氣現象"
  ).Time;
  const RainArray = cityData.WeatherElement.find(
    (e) => e.ElementName === "3小時降雨機率"
  ).Time;

  const nowHour = new Date().getHours();
  //即時溫度
  const currentTemperatureData = temperatureArray.find((e) => {
    const dataHour = new Date(e.DataTime).getHours();
    return dataHour === nowHour;
  });
  const currentTemperature = currentTemperatureData.ElementValue[0].Temperature;
  //console.log("即時溫度", currentTemperature);
  //即時濕度
  const currenthumidityData = humidityArray.find((e) => {
    const dataHour = new Date(e.DataTime).getHours();
    return dataHour === nowHour;
  });
  const currentHumidity = currenthumidityData.ElementValue[0].RelativeHumidity;
  //console.log("即時濕度", currentHumidity);
  //即時天氣狀況
  const currentDescriptionData = descriptionArray.find((e) => {
    const startHour = new Date(e.StartTime).getHours();
    const endHour = new Date(e.EndTime).getHours();
    return startHour <= nowHour && endHour > nowHour;
  });
  const currentDescription = currentDescriptionData.ElementValue[0].Weather;
  //console.log("即時天氣狀況", currentDescription);
  //即時降雨率
  const currentRainData = RainArray.find((e) => {
    const startHour = new Date(e.StartTime).getHours();
    const endHour = new Date(e.EndTime).getHours();
    return startHour <= nowHour && endHour > nowHour;
  });
  const currentRain =
    currentRainData.ElementValue[0].ProbabilityOfPrecipitation;
  //console.log("即時降雨率", currentRain);
  return {
    currentTemperature,
    currentHumidity,
    currentDescription,
    currentRain,
  };
}
async function test() {
  let answer = await getCurrentData("臺北市");
  console.log("answer:", answer);
}
test();
