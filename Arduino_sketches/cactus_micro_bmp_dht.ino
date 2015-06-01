#include <SoftwareSerial.h>
#include "DHT22.h"
#define DHT22_PIN 7 
 
 
#include <Wire.h>
#include <Adafruit_Sensor.h>
#include <Adafruit_BMP085_U.h>  //https://github.com/adafruit/Adafruit_BMP085_Unified            



// Important!! We use pin 13 for enable esp8266  
#define WIFI_ENABLE_PIN 13

#define SSID "SSID_DES_WLAN"
#define PASS "PASSWORT_DES_WLAN"


#define DEBUG 0



char serialbuffer[150];//serial buffer for request command
int wifiConnected = 0;

char StrBuffer [30];
char* CharTEMP;
char* CharHUM;
char* CharBAR;
char* CharDHTTEMPHead = "DHT2T|"; //Hier ggf eigene Namen vergeben.
char* CharDHTHUMHead = "DHT2H|";  //WICHTIG: Die Namen sollten nicht länger als 5 Zeichen sein
char* CharBMPHead = "BMP2|";

SoftwareSerial mySerial(11, 12); // rx, tx

DHT22 myDHT22(DHT22_PIN);
Adafruit_BMP085_Unified bmp = Adafruit_BMP085_Unified(10085);

void setup()
{
    mySerial.begin(9600);//connection to ESP8266
    Serial.begin(9600); //serial debug

    if(DEBUG) {
      while(!Serial);
    }
     if(!bmp.begin())
  {
    /* There was a problem detecting the BMP085 ... check your connections */
    Serial.print("Ooops, no BMP085 detected ... Check your wiring or I2C ADDR!");
  }

    pinMode(13, OUTPUT);
    digitalWrite(13, HIGH);
    delay(1000);//delay

    //set mode needed for new boards
    mySerial.println("AT+RST");
    delay(3000);//delay after mode change       
    mySerial.println("AT+CWMODE=1");
    delay(300);
    mySerial.println("AT+RST");
    delay(500);

}

boolean connectWifi() {     
 String cmd="AT+CWJAP=\"";
 cmd+=SSID;
 cmd+="\",\"";
 cmd+=PASS;
 cmd+="\"";
 Serial.println(cmd);
 mySerial.println(cmd);
           
 for(int i = 0; i < 20; i++) {
   Serial.print(".");
   if(mySerial.find("OK"))
   {
     wifiConnected = 1;
     break;
   }
   
   delay(50);
 }
 
 Serial.println(
   wifiConnected ? 
   "OK, Connected to WiFi." :
   "Can not connect to the WiFi."
 );
 if(wifiConnected) {
  mySerial.println("AT+CIPSTART=\"UDP\",\"192.168.1.255\",55655"); //Hier das korrekte Subetz + port eintragen
  Serial.println("AT+CIPSTART=\"UDP\",\"192.168.1.255\",55655");
  delay(500);
 }
 return wifiConnected;
}

void loop()
{

    if(!wifiConnected) {
      mySerial.println("AT");
      delay(1000);
      if(mySerial.find("OK")){
        Serial.println("Module Test: OK");
        connectWifi();
      } 
    }

    if(!wifiConnected) {
      delay(500);
      return;
    }

    //output everything from ESP8266 to the Arduino Micro Serial output
    while (mySerial.available() > 0) {
      Serial.write(mySerial.read());
    }

    //to send commands to the ESP8266 from serial monitor (ex. check IP addr)
    if (Serial.available() > 0) {
       //read from serial monitor until terminating character
       int len = Serial.readBytesUntil('\n', serialbuffer, sizeof(serialbuffer));

       //trim buffer to length of the actual message
       String message = String(serialbuffer).substring(0,len-1);
       Serial.println("message: " + message);

       //check to see if the incoming serial message is an AT command
       if(message.substring(0,2)=="AT"){
         //make command request
         Serial.println("COMMAND REQUEST");
         mySerial.println(message); 
       }//if not AT command, ignore
    }
      DHT22_ERROR_t errorCode;
      sensors_event_t event;
delay(2000);
  
  errorCode = myDHT22.readData();
  if(errorCode == DHT_ERROR_NONE) {
    float h = myDHT22.getHumidity();
    // Read temperature as Celsius
    float t = myDHT22.getTemperatureC();
    bmp.getEvent(&event);
    float bmptemperature;
    Serial.print(event.pressure);
    Serial.println(" hPa");
    bmp.getTemperature(&bmptemperature);
    Serial.print(bmptemperature);
    Serial.print(" , ");
    Serial.println(t);
    //float newRelHum = relHum(AF(h,t),bmptemperature);
    float newRelHum = relHum(AF(h,t),bmptemperature);
    
    
    Serial.print("Humidity: "); 
    Serial.print(h);
    Serial.print(" %\t");
    Serial.print("Temperature: "); 
    Serial.print(bmptemperature);
    Serial.println(" *C ");
    
    CharTEMP = dtostrf(bmptemperature,6,2,StrBuffer);
    Serial.println(CharTEMP);
    mySerial.print("AT+CIPSEND=");
    mySerial.println("13");
    delay(2000);
    mySerial.print(CharDHTTEMPHead);
    mySerial.println(CharTEMP);
    delay(3000);
    
    CharHUM = dtostrf(newRelHum,6,2,StrBuffer);
    mySerial.print("AT+CIPSEND=");
    mySerial.println("13");
    delay(2000);
    mySerial.print(CharDHTHUMHead);
    mySerial.println(CharHUM);
    delay(3000);
    
    CharBAR = dtostrf(event.pressure,6,2,StrBuffer);
    mySerial.print("AT+CIPSEND=");
    mySerial.println("13");
    delay(2000);
    mySerial.print(CharBMPHead);
    mySerial.println(CharBAR);
    delay(3000);
    
    
    
  }
 
    // Wait a few seconds between measurements.
  delay(43000);
     
     
}

float SDD(float T) { 
  if ( T >= 0 ) {
    return 6.1078 * pow(10,((7.5*T)/(237.3+T)));
  } else {
    return 6.1078 * pow(10,((7.6*T)/(240.7+T)));
  }
}
float DD(float r, float T) {
 return r/100 * SDD(T); 
}
float r(float T,float TD) {
 return  100 * SDD(TD) / SDD(T);
}
float TD(float r,float T) {  
   float v = log10(DD(r,T)/6.1078);
   if ( T >= 0 ) {
    return 237.3*v/(7.5-v);
  } else {
    return 240.7*v/(7.6-v);
  }
} 
float AF(float r, float T) {
 return pow(10,5)*18.016/8314.3 * DD(r,T)/(T+273.15);
}
float relHum(float AF, float T) { 
 float ss = (17.2694*T)/(238.3 + T);
 T = T+273.15;
 float ps = (0.61078*7.501) * pow(2.718281828,ss);
 float mv = (18.016/(0.0623665*T))*ps;
 return (AF/mv)*100;
}
