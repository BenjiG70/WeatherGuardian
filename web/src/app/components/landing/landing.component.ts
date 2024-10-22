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
            this.sensors = Object.values(data).map(sensorData => sensorData.sensor);
            this.updateSensorsData();
          } else {
            console.error('Unexpected data format:', data);
          }
        },
        (error: any) => {
          console.error('Error fetching sensors data:', error);
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

  // openDialog(sensor: any): void {
  //   this.dialog.open(DetailsComponent, {
  //     width: '150%',
  //     data: {
  //       sensorname: sensor.sensor,
  //       temperatur: sensor.temperature,
  //       luftfeuchte: sensor.humidity,
  //       luftdruck: sensor.air_pressure,
  //       regen: sensor.regen,
  //       zeit: sensor.DATE_TIME
  //     }
  //   });
  // }

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
