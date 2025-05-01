const apiKey = "CWA-3B96A556-9E4C-4F8D-87D7-6E09A56DCFC5";
const nowUrl = `https://opendata.cwa.gov.tw/api/v1/rest/datastore/F-D0047-089?Authorization=${apiKey}`;

async function fetchNow() {
  const res = await fetch(nowUrl);
  const data = await res.json();

  return data.records.Locations[0].Location;
}
export async function getCurrentData(cityName) {
  const data = await fetchNow();

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
  const now = new Date();
  const nextHour = new Date();
  nextHour.setHours(now.getHours() + 1);
  nextHour.setMinutes(0, 0, 0);
  //即時溫度
  const ifNoTempData = temperatureArray[0].ElementValue[0].Temperature;

  const currentTemperatureData =
    temperatureArray.find((e) => {
      const dataTime = new Date(e.DataTime);
      return dataTime > now && dataTime <= nextHour;
    }) || ifNoTempData;
  const currentTemperature = currentTemperatureData.ElementValue[0].Temperature;

  //即時濕度
  const ifNoHumidityData = humidityArray[0].ElementValue[0].RelativeHumidity;

  const currenthumidityData =
    humidityArray.find((e) => {
      const dataTime = new Date(e.DataTime);

      return dataTime > now && dataTime <= nextHour;
    }) || ifNoHumidityData;

  const currentHumidity = currenthumidityData.ElementValue[0].RelativeHumidity;

  //即時天氣狀況

  let currentDescriptionData = descriptionArray.find((e) => {
    const start = new Date(e.StartTime);
    const end = new Date(e.EndTime);
    return start <= now && now < end;
  });

  if (!currentDescriptionData) {
    currentDescriptionData = descriptionArray.find((e) => {
      const start = new Date(e.StartTime);
      return start > now;
    });
  }
  const currentDescription = currentDescriptionData.ElementValue[0].Weather;

  //即時降雨率
  let currentRainData = RainArray.find((e) => {
    const start = new Date(e.StartTime);
    const end = new Date(e.EndTime);
    return start <= now && now < end;
  });

  if (!currentRainData) {
    currentRainData = RainArray.find((e) => {
      const start = new Date(e.StartTime);
      return start > now;
    });
  }

  const currentRain =
    currentRainData.ElementValue[0].ProbabilityOfPrecipitation;

  return {
    currentTemperature,
    currentHumidity,
    currentDescription,
    currentRain,
  };
}
