#include <SPI.h>
#include <RF24.h>
#include <RF24Network.h>
#include "DumbWaiter.h"
// LED NODE
int me = 1;
DumbWaiter dw(me);

// bool L_BED = false;
// bool L_BATH = false;
// bool L_ATTIC = false;
int bedLight = 2;
int bathLight = 3;
int atticLight = 4;

void setup()
{
    // Serial.begin(9600);
    // Serial.print("NODE: ");
    // Serial.println(me);
    pinMode(bedLight, OUTPUT);
    pinMode(bathLight, OUTPUT);
    pinMode(atticLight, OUTPUT);
    dw.begin();
}

void loop()
{
    static int status = 0;

    dw.update();

    if (dw.available()) {
        DWPayload payload = dw.getData();
        // Serial.print("Method: ");
        // Serial.println(payload.method);
        // Serial.print("ARG: ");
        // Serial.println(payload.arg);
        // Do all of my logic asyncronously here
        if (payload.method == LIGHTS_BED) {
            // L_BED = payload.arg
            digitalWrite(bedLight, payload.arg);
            // status = (int)L_BED;
        } else if (payload.method == LIGHTS_BATH) {
            // L_BATH = payload.arg == 2 ? !L_BATH : payload.arg;
            digitalWrite(bathLight, payload.arg);
            // status = (int)L_BATH;
        } else if (payload.method == LIGHTS_ATTIC) {
            // L_ATTIC = payload.arg == 2 ? !L_ATTIC : payload.arg;
            digitalWrite(atticLight, payload.arg);
            // status = (int)L_ATTIC;
        }
        // return method and status as arg
        // in this case, because it is only output, the return value is the same as arg, assuming the above code works
        // in an input node, the return value would be useful and would respond with temperature or something.
        // Serial.print("Method: ");
        // Serial.println(payload.method);
        // Serial.print("ARG: ");
        // Serial.println(status);
        DWPayload p = {payload.method, payload.arg};
        dw.pong(&p);

    }
}