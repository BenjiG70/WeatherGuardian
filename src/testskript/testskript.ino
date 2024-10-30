#include <Wire.h>
#include <Adafruit_Sensor.h>
#include <Adafruit_BME280.h>
#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>

#define BME280_I2C_ADDRESS 0x76

// WiFi Konfiguration
const char* ssid = "<your_ssid>";
const char* password = "<your_password>";

// Server-URL
const char* serverUrl = "http://192.168.0.15:4202/insert/data";

WiFiClient wifiClient;  // Erstelle ein WiFiClient-Objekt
Adafruit_BME280 bme;    // Erstelle ein BME280-Objekt

void setup() {
  Serial.begin(115200);
  
  // Initialisiere die I2C-Schnittstelle auf anderen Pins
  Wire.begin(D3, D4); // SDA auf D3 (GPIO 0), SCL auf D4 (GPIO 2)

  // BME280 Initialisierung
  if (!bme.begin(BME280_I2C_ADDRESS)) {
    while (1);
  }

  // WiFi-Verbindung herstellen
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
  }
}

void loop() {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;

    // Sensordaten auslesen
    float temperature = bme.readTemperature();
    float humidity = bme.readHumidity();
    float pressure = bme.readPressure() / 100.0F;

    // POST-Request vorbereiten
    http.begin(wifiClient, serverUrl);
    http.addHeader("Content-Type", "application/json");

    // JSON-Daten erstellen
    String jsonPayload = "{\"temperature\":" + String(temperature) +
                         ",\"humidity\":" + String(humidity) +
                         ",\"air_pressure\":" + String(pressure) +
                         ",\"sensor\":\"Dachboden\"}";

    // POST-Anfrage senden
    int httpResponseCode = http.POST(jsonPayload);

    // Verbindung schließen
    http.end();
  } 
}
