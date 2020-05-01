float flts[4];

void setup() {
  // Definition of an anchor (to synchronize the stream
  unsigned long * db = (unsigned long *)flts;
  *db = 0xDEADBEEFUL;
  // Values to send
  flts[1] = 12.54;
  flts[2] = -27.001;
  flts[3] = 0;
  Serial.begin(115200);
}

void loop() {
  // put your main code here, to run repeatedly:
  char * msg = (char*)(&flts);
  Serial.write(msg, 16);
  Serial.flush();
  delay(10);
}
