#include <SPI.h>
#include <RF24.h>
#include <RF24Network.h>
#include "DumbWaiter.h"
// Tarmostat NODE
int me = 5;
DumbWaiter dw(me);

int upPin = 3;
int downPin = 2;

int d = 200;


void setup()
{
    // Serial.begin(57600);
    pinMode(upPin, OUTPUT);
    pinMode(downPin, OUTPUT);
    dw.begin();
}

void loop()
{
    dw.update();
    static int slideDiff = 0;

    if (dw.available()) {
        DWPayload payload = dw.getData();
        // Serial.print("Method: ");
        // Serial.println(payload.method);
        // Serial.print("ARG: ");
        // Serial.println(payload.arg);
        // Do all of my logic asyncronously here

        if (payload.method == TEMP_HOUSE) {
            // else, set as setpoint
            slideDiff = payload.arg;
        }

        if (slideDiff > 5000) {
            slideDiff = (slideDiff-5000)*-1;
        }

        DWPayload p = {payload.method, slideDiff};
        dw.pong(&p);

        // just blink shit to amke sure it works

        // example: SP: 72 TEMP: 70
        // slideDiff = 2, meaning up two times
        if (slideDiff < 0) {
            // press up button slideDiff times
            for(int i=0; i<(slideDiff*-1); i++){
                digitalWrite(upPin, HIGH);
                delay(d);
                digitalWrite(upPin, LOW);
                delay(d+500);
            }
        } else if (slideDiff > 0) {
            for(int i=0; i<slideDiff; i++){
                digitalWrite(downPin, HIGH);
                delay(d);
                digitalWrite(downPin, LOW);
                delay(d+500);
            }
        }

    }
}