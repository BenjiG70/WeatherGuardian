import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-weathercards',
  templateUrl: './weathercards.component.html',
  styleUrl: './weathercards.component.scss'
})
export class WeathercardsComponent {

  private _date: any = "NaN"; // Private Variable für das Datum
  formattedDate: string = ''; // Für das formatierte Datum

  @Input() sensor:string = "default";
  @Input() temperature:number = 0;
  @Input() humidity:number = 0;
  @Input() air_pressure:number=0;
  @Input() rain:boolean = false;
  @Input()

  set date(value: any) {
    // Stelle sicher, dass der Wert ein Zeitstempel ist
    this._date = new Date(Number(value)); // Umwandlung in ein Date-Objekt
    console.log('Eingangswert für date:', value); // Debugging-Ausgabe
    this.formattedDate = this.formatDate(this._date); // Formatiere das Datum
  }

  get date(): any {
    return this._date;
  }

  private formatDate(value: Date): string {
    if (isNaN(value.getTime())) {
      return 'Ungültiges Datum';
    }
    return value.toLocaleDateString('de-DE');
  }
}


