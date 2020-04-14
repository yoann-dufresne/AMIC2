#include <SPI.h>
#include <nRF24L01.h>
#include <RF24.h>

// --- Radio reception ---
RF24 radio(7, 8); // CE, CSN
const byte address[6] = "00001";
char msg[12];
float* values = (float*)msg;

void setup() {
  Serial.begin(9600);
  radio.begin();
  radio.openReadingPipe(0, address);
  radio.setPALevel(RF24_PA_MIN);
  radio.startListening();
}
void loop() {
  if (radio.available()) {
    radio.read(&msg, sizeof(msg));
    
    Serial.println(values[0]);
    Serial.println(values[1]);
    Serial.println(values[2]);
    Serial.println();
  }
}
