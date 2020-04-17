#include <SPI.h>
#include <nRF24L01.h>
#include <RF24.h>

// --- Radio reception ---
RF24 radio(7, 8); // CE, CSN
const byte address[6] = "00001";
char msg[16];
float* values = (float*)msg;

void setup() {
  unsigned long * db = (unsigned long *)values;
  *db = 0xDEADBEEFUL;
  values += 1;
  
  Serial.begin(115200);
  radio.begin();
  radio.openReadingPipe(0, address);
  radio.setPALevel(RF24_PA_MIN);
  radio.startListening();
}
void loop() {
  if (radio.available()) {
    radio.read(values, 12);
    Serial.write(msg, 16);
    Serial.flush();
  }
}
