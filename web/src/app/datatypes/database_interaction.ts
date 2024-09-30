export interface WeatherData {
    DATE_TIME: string;
    ID: number;
    temperature: number;
    humidity: number;
    air_pressure: number;
    sensor: string;
    regen: number;
  }

export interface apiData {
  [key:string]: WeatherData;
}
export interface WeatherEntry {
  date: string;
  regen: number;
  temperature: number;
  air_pressure: number;
  humidity: number;
}

export interface statsData{
  date: string;
  time: string;
  temperature: number;
  humidity: number;
  air_pressure: number;
  regen: number;
}