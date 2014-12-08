#include <SPI.h>
#include <RF24.h>
#include <RF24Network.h>
#include "DumbWaiter.h"

#include <Servo.h>

#define TURN_SCALAR 1.07

// Garage NODE
int me = 3;
DumbWaiter dw(me);

// bool L_GARAGE = false;
// int GARAGE_ANGLE = 0;
// bool GARAGE_STATE = false;

Servo garage;
int garageLight = 2;
int garageServo = 3;

void setup()
{
    // Serial.begin(57600);
    pinMode(garageLight, OUTPUT);
    pinMode(garageServo, OUTPUT);
    garage.attach(garageServo);
    dw.begin();
    garage.write(0);
}

void loop()
{

    static int status = 0;
    dw.update();

    if (dw.available()) {
        DWPayload payload = dw.getData();
        // Do all of my logic asyncronously here

        if (payload.method == GARAGE) {
            // move servo
            if (payload.arg) {
                open();
            } else {
                close();
            }
        } else if (payload.method == LIGHTS_GARAGE) {
            digitalWrite(garageLight, payload.arg);
        }

        // return method and status as arg
        // in this case, because it is only output, the return value is the same as arg, assuming the above code works
        // in an input node, the return value would be useful and would respond with temperature or something.
        DWPayload p = {payload.method, payload.arg};
        dw.pong(&p);

    }
}


void open()
{
    garage.write(90);
}

void close()
{
    garage.write(0);
}