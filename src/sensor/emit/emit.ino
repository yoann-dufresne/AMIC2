#include <MPU6050_tockn.h>
#include <Wire.h>
#include <SPI.h> // Not actually used but needed to compile
#include <RH_ASK.h>


RH_ASK driver = RH_ASK(2000);
MPU6050 mpu6050(Wire);

void setup()
{
    Serial.begin(9600);	  // Debugging only
    if (!driver.init())
         Serial.println("init failed");

    Wire.begin();
    mpu6050.begin();
    mpu6050.calcGyroOffsets();
}

float angle = 0;

void loop()
{
    mpu6050.update();
    angle = mpu6050.getAngleZ();
    driver.send((uint8_t *)&angle, sizeof(float));
    driver.waitPacketSent();
}
