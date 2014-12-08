#ifndef DumbWaiter_h
#define DumbWaiter_h

#include "Arduino.h"
#include <RF24.h>
#include <RF24Network.h>


// METHODS
#define TEMP_HOUSE 0
#define TEMP_COFFEE 1
#define LIGHTS_BED 2
#define LIGHTS_BATH 3
#define LIGHTS_KITCHEN 4
#define LIGHTS_GARAGE 5
#define GARAGE 6
#define LIGHTS_ATTIC 7
#define PASSTHROUGH 8

struct DWPayload {
    unsigned int method;
    int arg;
};


class DumbWaiter
{
    public:
        DumbWaiter(int node);
        bool available();
        DWPayload getData();
        void begin();
        bool send(DWPayload *p, int addr);
        void update();
        bool pong(DWPayload *p);
    private:
        int _addr;

};



#endif