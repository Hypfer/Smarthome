#include <SoftwareSerial.h>
#include "EmonLib.h"                   // Include Emon Library
EnergyMonitor emon1;                   // Create an instance



// Important!! We use pin 13 for enable esp8266  
#define WIFI_ENABLE_PIN 13

#define SSID "SSID_DES_WLAN"
#define PASS "PASSWORT_DES_WLAN"


#define DEBUG 0



char serialbuffer[100];//serial buffer for request command
int wifiConnected = 0;

char StrBuffer [10];
char* Ampere;
char* Header = "EMON|"; //ggf. eigener Name WICHTIG: Die Namen sollten nicht länger als 5 Zeichen sein

SoftwareSerial mySerial(11, 12); // rx, tx

void setup()
{
    mySerial.begin(9600);//connection to ESP8266
    Serial.begin(9600); //serial debug

    if(DEBUG) {
      while(!Serial);
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
    emon1.current(2, 35.71);

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
    Serial.println(analogRead(A2));
    double Irms = (emon1.calcIrms(1480)+emon1.calcIrms(1480)+emon1.calcIrms(1480)+emon1.calcIrms(1480)+emon1.calcIrms(1480)+emon1.calcIrms(1480)+emon1.calcIrms(1480)+emon1.calcIrms(1480)+emon1.calcIrms(1480)+emon1.calcIrms(1480)+emon1.calcIrms(1480)+emon1.calcIrms(1480)+emon1.calcIrms(1480)+emon1.calcIrms(1480)+emon1.calcIrms(1480)+emon1.calcIrms(1480)+emon1.calcIrms(1480)+emon1.calcIrms(1480)+emon1.calcIrms(1480)+emon1.calcIrms(1480)+emon1.calcIrms(1480)+emon1.calcIrms(1480)+emon1.calcIrms(1480)+emon1.calcIrms(1480)+emon1.calcIrms(1480)+emon1.calcIrms(1480)+emon1.calcIrms(1480)+emon1.calcIrms(1480)+emon1.calcIrms(1480)+emon1.calcIrms(1480)+emon1.calcIrms(1480)+emon1.calcIrms(1480)+emon1.calcIrms(1480)+emon1.calcIrms(1480)+emon1.calcIrms(1480)+emon1.calcIrms(1480)+emon1.calcIrms(1480)+emon1.calcIrms(1480)+emon1.calcIrms(1480)+emon1.calcIrms(1480)+emon1.calcIrms(1480)+emon1.calcIrms(1480)+emon1.calcIrms(1480)+emon1.calcIrms(1480)+emon1.calcIrms(1480)+emon1.calcIrms(1480)+emon1.calcIrms(1480)+emon1.calcIrms(1480)+emon1.calcIrms(1480)+emon1.calcIrms(1480)+emon1.calcIrms(1480)+emon1.calcIrms(1480)+emon1.calcIrms(1480)+emon1.calcIrms(1480)+emon1.calcIrms(1480)+emon1.calcIrms(1480)+emon1.calcIrms(1480)+emon1.calcIrms(1480)+emon1.calcIrms(1480)+emon1.calcIrms(1480)+emon1.calcIrms(1480)+emon1.calcIrms(1480)+emon1.calcIrms(1480)+emon1.calcIrms(1480)+emon1.calcIrms(1480)+emon1.calcIrms(1480)+emon1.calcIrms(1480)+emon1.calcIrms(1480)+emon1.calcIrms(1480)+emon1.calcIrms(1480)+emon1.calcIrms(1480)+emon1.calcIrms(1480)+emon1.calcIrms(1480)+emon1.calcIrms(1480)+emon1.calcIrms(1480)+emon1.calcIrms(1480)+emon1.calcIrms(1480)+emon1.calcIrms(1480)+emon1.calcIrms(1480)+emon1.calcIrms(1480)+emon1.calcIrms(1480)+emon1.calcIrms(1480)+emon1.calcIrms(1480)+emon1.calcIrms(1480)+emon1.calcIrms(1480)+emon1.calcIrms(1480)+emon1.calcIrms(1480)+emon1.calcIrms(1480)+emon1.calcIrms(1480)+emon1.calcIrms(1480))/90;
    Ampere = dtostrf(Irms,6,2,StrBuffer);
    Serial.println(Ampere);  
     mySerial.print("AT+CIPSEND=");
     mySerial.println("13");
     delay(1000);
     mySerial.print(Header);
     mySerial.println(Ampere);
     
     
}

