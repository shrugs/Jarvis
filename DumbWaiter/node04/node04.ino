#include <SPI.h>
#include <RF24.h>
#include <RF24Network.h>
#include "DumbWaiter.h"
// Passthrough NODE
int me = 4;
DumbWaiter dw(me);

// bool P_STATE = false;
int pPin = 2;

void setup()
{
    // Serial.begin(57600);
    pinMode(pPin, OUTPUT);
    delay(2000);
    dw.begin();
}

void loop()
{
    dw.update();

    if (dw.available()) {
        DWPayload payload = dw.getData();
        // Serial.print("Method: ");
        // Serial.println(payload.method);
        // Serial.print("ARG: ");
        // Serial.println(payload.arg);
        // Do all of my logic asyncronously here

        if (payload.method == PASSTHROUGH) {
            digitalWrite(pPin, payload.arg);
        }

        // return method and status as arg
        // in this case, because it is only output, the return value is the same as arg, assuming the above code works
        // in an input node, the return value would be useful and would respond with temperature or something.
        DWPayload p = {payload.method, payload.arg};
        dw.pong(&p);
    }
}