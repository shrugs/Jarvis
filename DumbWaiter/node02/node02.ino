#include <SPI.h>
#include <RF24.h>
#include <RF24Network.h>
#include "DumbWaiter.h"
// Kitchen NODE
int me = 2;
DumbWaiter dw(me);

//degrees C
// float TEMP_SETPOINT = 20;
// float TEMP_ERR = 2;
// float TEMP_LCL = TEMP_SETPOINT-TEMP_ERR;
// float TEMP_UCL = TEMP_SETPOINT+TEMP_ERR;

int hPin = 7;
// int thermistorPin = A1;
// bool heaterState = false;
// float temperature = 0;

// bool L_KITCHEN = false;
int kitchenLight = 2;

void setup()
{
    // Serial.begin(57600);
    pinMode(kitchenLight, OUTPUT);
    // pinMode(thermistorPin, INPUT);
    pinMode(hPin, OUTPUT);
    dw.begin();
}

void loop()
{
    static double target;
    static int status = 0;

    dw.update();

    if (dw.available()) {
        DWPayload payload = dw.getData();
        // Serial.print("Method: ");
        // Serial.println(payload.method);
        // Serial.print("ARG: ");
        // Serial.println(payload.arg);
        // Do all of my logic asyncronously here

        if (payload.method == LIGHTS_KITCHEN) {
            digitalWrite(kitchenLight, payload.arg);
        } else if (payload.method == TEMP_COFFEE) {
            // just tun the heater on and off
            digitalWrite(hPin, payload.arg);
        }
        // return infos
        DWPayload p = {payload.method, payload.arg};
        dw.pong(&p);

        // // regulate temperature
        // temperature = getTemperature();

        // // async temperature changing
        // if (temperature < TEMP_LCL) {
        //     // below setpoint
        //     digitalWrite(hPin, HIGH);
        //     heaterState = true;
        //     Serial.println("TURN ON HEATER BRAH");
        // } else if (temperature > TEMP_UCL) {
        //     heaterState = false;
        //     digitalWrite(hPin, LOW);
        //     Serial.println("TURN HEATER OFF BRO");
        // }

    }
}

// float getTemperature() {
//     float x = 0.0;
//     float samples = 5.0;
//     for(int i=0; i<samples; i++){
//         x += analogRead(thermistorPin);
//         delay(100);
//     }

//     x = x/samples;

//     return 0.1153 * x - 31.383;

// }