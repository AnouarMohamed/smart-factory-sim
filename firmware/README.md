# Virtual Firmware Mirror

This folder mirrors the Arduino and ESP8266 firmware architecture in TypeScript. It is not compiled for hardware. The browser simulation uses these files as documented, readable equivalents of the embedded control loops.

## Modules

- `robot_main/robot_main.ino.ts`: setup and loop structure.
- `robot_main/state_machine.cpp.ts`: firmware state transitions.
- `robot_main/config.h.ts`: pin and timing constants.
- `sensors/*`: ultrasonic, IR array, and encoder driver mirrors.
- `actuators/*`: motor, servo, and PID driver mirrors.
- `communication/*`: WiFi, MQTT, and telemetry packet mirrors.

