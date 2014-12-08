
#include "Arduino.h"
#include "DumbWaiter.h"

RF24 _radio(9, 10);
RF24Network _network(_radio);
int _root = 0;

DumbWaiter::DumbWaiter(int addr)
{
    _addr = addr;
}

bool DumbWaiter::available()
{
    return _network.available();
}

DWPayload DumbWaiter::getData()
{
    RF24NetworkHeader header;
    DWPayload p;
    _network.read(header, &p, sizeof(p));

    return p;
}

bool DumbWaiter::send(DWPayload *p, int addr)
{
    RF24NetworkHeader header(addr);
    return _network.write(header, p, sizeof(*p));
}

void DumbWaiter::begin()
{
    SPI.begin();
    _radio.begin();
    _network.begin(90, _addr);
}

void DumbWaiter::update()
{
    _network.update();
}

bool DumbWaiter::pong(DWPayload *p)
{
    this->send(p, _root);
    // bool ok = false;
    // int attempt = 0;
    // int attempts = 4;
    // while (!ok && (attempt < attempts)) {
    //     ok = this->send(p, _root);
    //     attempt ++;
    // }
    // return;
}