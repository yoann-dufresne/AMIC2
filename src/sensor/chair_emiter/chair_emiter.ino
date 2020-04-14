#include <MPU6050_tockn.h>
#include <Wire.h>

#include <SPI.h>
#include <nRF24L01.h>
#include <RF24.h>

// --- Radio transmition ---
RF24 radio(7, 8); // CE, CSN
const byte address[6] = "00001";
char msg[12]; // 3 floats 4 bytes each
// --- Inertial sensor ---
MPU6050 mpu6050(Wire);
float* values = (float*)msg;

void setup() {
  Serial.begin(9600);
  // --- Radio transmition ---
  radio.begin();
  radio.openWritingPipe(address);
  radio.setPALevel(RF24_PA_MIN);
  radio.stopListening();
  // --- Inertial sensor ---
  Wire.begin();
  mpu6050.begin();
  mpu6050.calcGyroOffsets();
}

void loop() {
  mpu6050.update();
  values[0] = mpu6050.getAngleX();
  values[1] = mpu6050.getAngleY();
  values[2] = mpu6050.getAngleZ();
  Serial.println(values[0]);
  Serial.println(values[1]);
  Serial.println(values[2]);
  Serial.println();
  radio.write(msg, sizeof(msg));
}
