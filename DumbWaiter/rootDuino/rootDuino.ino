
#include <SPI.h>
#include <RF24.h>
#include <RF24Network.h>
#include "DumbWaiter.h"

const int methods[6][3] = {
    {}, //rootDuino doesn't do shit
    {LIGHTS_BED, LIGHTS_BATH, LIGHTS_ATTIC}, // Arduino 1 deals with 3 LEDS, bed, bath, kitchen
    {TEMP_COFFEE, LIGHTS_KITCHEN}, // Arduino 2 deals with Kitchen things
    {GARAGE, LIGHTS_GARAGE}, // Arduino 3 deals with Garage and Garage light
    {PASSTHROUGH}, //120VAC Passthrough Node
    {TEMP_HOUSE}, //Thermostat Node
};

// number of methods each node deals with, because C
const int methodCounts[] = {
    0,
    3,
    2,
    2,
    1,
    1
};


DumbWaiter dw(0);

int timeout = 1500;
unsigned int prev = 0;
bool didFire = false;

void setup()
{
    Serial.begin(57600);
    // Serial.println("ROOT");

    dw.begin();
}

void loop()
{
    dw.update();

    int method = -1;
    int arg = -1;

    while (Serial.available()) {
        delay(10);
        method = Serial.parseInt();
        arg = Serial.parseInt();
    }

    // method = 3;
    // arg = 1;

    if (method != -1 && arg != -1) {
        // Serial.println(method);
        // Serial.println(arg);
        DWPayload p = {method, arg};

        int addr = -1;
        // look up address
        for(int node=1; node<6; node++){
            for(int m=0; m<methodCounts[node]; m++){
                if (methods[node][m] == method) {
                    // this is the addr
                    addr = node;
                    break;
                }
            }
            if (addr != -1) {
                break;
            }
        }


        bool ok = dw.send(&p, addr);

        if (ok) {
            // Serial.println("SUCCESS");

            // now wait for a response for timeout or data, whichever is first
            // prev = millis() + timeout;
            // didFire = false;
            // while(true) {
            //     dw.update();
            //     if ((int)(millis() - prev) >= 0) {
            //         Serial.print(millis()-prev);
            //         Serial.print(" ");
            //         Serial.println("No pong");
            //         break;
            //     } else if (dw.available()) {
            //         DWPayload payload = dw.getData();
            //         Serial.print(payload.method);
            //         Serial.print(":");
            //         Serial.println(payload.arg);
            //         didFire = true;
            //         break;
            //     }
            //     delay(10);
            // }
            didFire = false;
            for(int i=0; i<100; i++){
                if (dw.available()) {
                    DWPayload payload = dw.getData();
                    Serial.print(payload.method);
                    Serial.print(":");
                    Serial.println(payload.arg);
                    didFire = true;
                    break;
                } else {
                    delay(10);
                }
            }

            if (!didFire) {
                Serial.println("No pong");
            }

        } else {
            Serial.println("FAIL");
        }
    }

}