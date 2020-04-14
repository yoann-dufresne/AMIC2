#include <RH_ASK.h>
#include <SPI.h> // Not actualy used but needed to compile

RH_ASK driver = RH_ASK(2000);

void setup()
{
    Serial.begin(115200);	// Debugging only
    if (!driver.init())
         Serial.println("init failed");
}

void loop()
{
    float buf;
    uint8_t buflen = sizeof(buf);
    if (driver.recv((uint8_t *)&buf, &buflen)) // Non-blocking
    {
      // Message with a good checksum received, dump it.
      Serial.println(buf);
    }
}
