#include <SPI.h> // Not actually used but needed to compile
#include <RH_ASK.h>

RH_ASK driver;

void setup()
{
    Serial.begin(9600);	  // Debugging only
    if (!driver.init())
         Serial.println("init failed");
}

unsigned int cpt = 0;

void loop()
{
    driver.send((uint8_t *)&cpt, sizeof(unsigned int));
    driver.waitPacketSent();
    cpt += 1;
}
