
#include <Servo.h>
Servo servoLeft;
Servo servoRight;
const int ledPin1 = 2;
const int ledPin2 = 7;
const int ledPin3 = 3;

unsigned long previousMillisVert = 0;
unsigned long previousMillisTilt = 0;
unsigned long previousMillisVertrev = 0;
unsigned long previousMillisTiltrev = 0;
unsigned long previousMillisDelight = 0;
unsigned long previousMillisEngineLight = 0;

long intervalVert = 0; 
long intervalTilt = 0; 
long intervalVertrev = 0; 
long intervalTiltrev = 0; 
long intervalDelight = 0; 
long intervalEngineLight = 0; 

bool isWaitingVert = false;
bool isWaitingTilt = false;
bool isWaitingVertrev = false;
bool isWaitingTiltrev = false;
bool isWaitingDelight = false;
bool isWaitingEngineLight = false;

void setup() {
  Serial.begin(9600);
  servoLeft.attach(11);
  servoLeft.writeMicroseconds(1525);
  servoRight.attach(13);
  servoRight.writeMicroseconds(1525);
  pinMode(ledPin1, OUTPUT);
  pinMode(ledPin2, OUTPUT);
  pinMode(ledPin3, OUTPUT);
}
void loop() {
  unsigned long currentMillis = millis();
  if (Serial.available()) {
    int num = Serial.read();
    Serial.print(Serial.read());
    if (num == '3') {
      delight(4);
    }
    if (num == '1') {
      wheelvert(180);
    }
    if (num == '6') {
      wheelvertrev(180);
    }
    if (num == '2') {
      wheeltilt(180);     
    }
    if (num == '5') {
      wheeltiltrev(180);     
    }
    if (num == '7') {
      enginelight(20);      
    }
  }
  if(isWaitingVert && (currentMillis - previousMillisVert >= intervalVert)) {
    servoLeft.writeMicroseconds(1525);
    isWaitingVert = false;
    previousMillisVert = 0;
    intervalVert = 0;
  }
  if(isWaitingTilt && (currentMillis - previousMillisTilt >= intervalTilt)) {
    servoRight.writeMicroseconds(1525);
    isWaitingTilt = false;
    previousMillisTilt = 0;
    intervalTilt = 0;
  }
  if(isWaitingVertrev && (currentMillis - previousMillisVertrev >= intervalVertrev)) {
    servoLeft.writeMicroseconds(1525);
    isWaitingVertrev = false;
    previousMillisVertrev = 0;
    intervalVertrev = 0;
  }
  if(isWaitingTiltrev && (currentMillis - previousMillisTiltrev >= intervalTiltrev)) {
    servoRight.writeMicroseconds(1525);
    isWaitingTiltrev = false;
    previousMillisTiltrev = 0;
    intervalTiltrev = 0;
  }
  if(isWaitingDelight && (currentMillis - previousMillisDelight >= intervalDelight)) {
    digitalWrite(ledPin2, LOW);
    digitalWrite(ledPin1, LOW);
    isWaitingDelight = false;
    previousMillisDelight = 0;
    intervalDelight = 0;
  }
  if(isWaitingEngineLight && (currentMillis - previousMillisEngineLight >= intervalEngineLight)) {
    digitalWrite(ledPin3, LOW);
    isWaitingEngineLight = false;
    previousMillisEngineLight = 0;
    intervalEngineLight = 0;
  }
}
void wheelvert(int degree) {
  int msec = 0;
  msec = (degree / .03);
  servoLeft.writeMicroseconds(1540);
  intervalVert = msec;
  previousMillisVert = millis();
  isWaitingVert = true;
}
void wheeltilt(int degree) {
  int msec = 0;
  msec = (degree / .03);
  servoRight.writeMicroseconds(1540);
  intervalTilt = msec;
  previousMillisTilt = millis();
  isWaitingTilt = true;
}
void wheelvertrev(int degree) {
  int msec = 0;
  msec = (degree / .03);
  servoLeft.writeMicroseconds(1510);
  intervalVertrev = msec;
  previousMillisVertrev = millis();
  isWaitingVertrev = true;
}
void wheeltiltrev(int degree) {
  int msec = 0;
  msec = (degree / .03);
  servoRight.writeMicroseconds(1510);
  intervalTiltrev = msec;
  previousMillisTiltrev = millis();
  isWaitingTiltrev = true;
}
void enginelight(int z) {
  digitalWrite(ledPin3, HIGH);
  intervalEngineLight = 500;
  previousMillisEngineLight = millis();
  isWaitingEngineLight = true;
}
void delight(int n) {
  digitalWrite(ledPin2, HIGH);
  digitalWrite(ledPin1, HIGH);
  intervalDelight = 500;
  previousMillisDelight = millis();
  isWaitingDelight = true;
}
