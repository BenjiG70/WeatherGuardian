import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DatabaseService } from '../../services/database.service';
import { DetailsComponent } from '../details/details.component';
import { Subscription, interval } from 'rxjs';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.scss'
})
export class LandingComponent implements OnInit, OnDestroy {
  sensorsData: any[] = [];
  private sensors: string[] = [];
  private updateSubscription?: Subscription;
  private sensorDataforStats:any;
  statTempData:any;
  statHumData:any;
  statLabel:any;

  constructor(private dbService: DatabaseService, public dialog: MatDialog) {}

  ngOnInit(): void {
    this.loadAllSensors();
    this.startDataRefresh();
  }
  
  loadAllSensors(): void {
    const reloadInterval = 5000; // 5 Sekunden
    let retryInterval: any;
  
    const fetchData = () => {
      this.dbService.getAllData().subscribe(
        (data: unknown) => {
          if (this.isSensorData(data)) {
            if (retryInterval) {
              clearInterval(retryInterval);  // Timer stoppen, wenn Daten erfolgreich geladen wurden
            }
            this.sensorDataforStats = Object.values(data);
            this.sensors = Object.values(data).map(sensorData => sensorData.sensor);
            this.getStatsData();
            this.updateSensorsData();
          } else {
            // console.error('Unexpected data format:', data);
          }
        },
        (error: any) => {
          // console.error('Error fetching sensors data:', error);
          this.sensorsData = [];
  
          // Alle 5 Sekunden erneut versuchen, wenn keine Verbindung hergestellt werden kann
          if (!retryInterval) {
            retryInterval = setInterval(fetchData, reloadInterval);
          }
        }
      );
    };
  
    // Erste Datenabfrage
    fetchData();
  }
  prepareChartData(monthlyAverages: { [key: string]: { avgTemp: number, avgHum: number } }) {
    // Extrahieren der Monatsnamen für die Labels
    const monthLabels = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    // Arrays für Temperatur- und Luftfeuchtigkeitsdurchschnitte
    const tempData: number[] = [];
    const humData: number[] = [];

    // Durchschnittswerte in Reihenfolge der Monate in die Arrays schreiben
    monthLabels.forEach((_, index) => {
        tempData.push(monthlyAverages[index].avgTemp);
        humData.push(monthlyAverages[index].avgHum);
    });
    return {tempData, humData, monthLabels}
  }
  avgData(months: number[][][]): { [key: string]: { avgTemp: number, avgHum: number } } {
    const averages: { [key: string]: { avgTemp: number, avgHum: number } } = {};

    // Monatliche Durchschnittswerte berechnen
    months.forEach((monthData, index) => {
        if (monthData.length === 0) {
            // Wenn der Monat keine Daten enthält, setzen wir den Durchschnitt auf 0
            averages[this.getMonthName(index)] = { avgTemp: 0, avgHum: 0 };
        } else {
            // Summen für Temperatur und Luftfeuchtigkeit berechnen
            const tempSum = monthData.reduce((sum, entry) => sum + entry[1], 0);
            const humSum = monthData.reduce((sum, entry) => sum + entry[2], 0);

            // Durchschnitt berechnen
            const avgTemp = tempSum / monthData.length;
            const avgHum = humSum / monthData.length;

            // Durchschnittswerte im Ergebnisobjekt speichern
            averages[this.getMonthName(index)] = { avgTemp, avgHum };
        }
    });

    return averages;
}
getMonthName(index: number): string {
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  return monthNames[index];
}

  sortDataByMonth(time: number[], temp: number[], hum: number[]) {
    // Array mit 12 leeren Arrays für jeden Monat
    const months: number[][][] = Array.from({ length: 12 }, () => []);

    // Daten in die richtigen Monats-Arrays einsortieren
    for (let i = 0; i < time.length; i++) {
        const date = new Date(time[i]);
        const month = date.getUTCMonth(); // Monat als Index nutzen (0 = Jan, 11 = Dez)

        // Werte in das entsprechende Monats-Array einfügen
        months[month].push([time[i], temp[i], hum[i]]);
    }
    return months;
}

  getMonth(time:string){
    const date = new Date(Number(time)) //convert given time to date-object
    const year = date.getFullYear(); //get year of given date
    const month = date.getMonth(); //get month of given date
    return year * 100 + month; //convert year and month to format YYYYMM
  }
  sortDataByimportant(){
    const data = this.sensorDataforStats;
    let time:any[] =[];
    let temp:any[] =[];
    let hum:any[]=[];
    for(let i=0; i < Object.keys(data).length; i++){
      temp.push(data[i].temperature);
      hum.push(data[i].humidity);
      time.push(new Date(Number(data[i].DATE_TIME)));
    }
    const sortedData:number[][][] = this.sortDataByMonth(time, temp, hum);
    const avgValues = this.avgData(sortedData);
    const {tempData, humData, monthLabels} = this.prepareChartData(avgValues);
    this.statTempData = tempData;
    this.statHumData = humData;
    this.statLabel = monthLabels;
  }
  getStatsData(){
    this.sortDataByimportant();
  }

  updateSensorsData(): void {
    this.sensors.forEach(sensor => {
      this.dbService.getLastWeatherDataBySensor(sensor).subscribe(
        (data: unknown) => {
          if (this.isWeatherData(data)) {
            const dataArray = Object.values(data);
            const latestData = dataArray[0]; 
            this.sensorsData = this.sensorsData.filter(d => d.sensor !== latestData.sensor);
            this.sensorsData.push(latestData);
          } else {
            console.error(`Unexpected data format for sensor ${sensor}:`, data);
          }
        },
        (error:any) => {
          console.error(`Error fetching last data for sensor ${sensor}:`, error);
        }
      );
    });
  }

  startDataRefresh(): void {
    this.updateSubscription = interval(60000).subscribe(() => {
      this.updateSensorsData();
    });
  }

  openDialog(sensor: any): void {
    this.dialog.open(DetailsComponent, {
      width: '150%',
      data: {
        sensor: sensor
      }
    });
  }

  ngOnDestroy(): void {
    if (this.updateSubscription) {
      this.updateSubscription.unsubscribe();
    }
  }

  private isSensorData(data: unknown): data is { [key: string]: { sensor: string } } {
    return typeof data === 'object' && data !== null && Object.values(data).every(item => 'sensor' in item);
  }

  private isWeatherData(data: unknown): data is { [key: string]: any } {
    return typeof data === 'object' && data !== null && Object.values(data).every(item => 'sensor' in item);
  }
}
