# Virtual Firmware

The firmware folder mirrors embedded robot logic in TypeScript. It is not compiled to Arduino binaries and never talks to hardware.

## Structure

| Path | Responsibility |
|---|---|
| `firmware/robot_main/robot_main.ino.ts` | Arduino-style `setup()` and `loop()` mirror. |
| `firmware/robot_main/state_machine.cpp.ts` | Firmware state transition helper. |
| `firmware/robot_main/config.h.ts` | Pin constants and loop timing. |
| `firmware/sensors/ultrasonic.cpp.ts` | HC-SR04 echo pulse conversion. |
| `firmware/sensors/ir_array.cpp.ts` | Five-sensor line error calculation. |
| `firmware/sensors/wheel_encoder.cpp.ts` | Encoder tick accumulation. |
| `firmware/actuators/motor_driver.cpp.ts` | PWM command clamping. |
| `firmware/actuators/servo_controller.cpp.ts` | Servo pulse conversion. |
| `firmware/actuators/pid_controller.cpp.ts` | Embedded PID step mirror. |
| `firmware/communication/*` | WiFi, MQTT, and telemetry packet mirrors. |

## Relationship To Simulation

The browser simulation owns the actual runtime behavior. Firmware files document how the same logic maps to embedded concepts: pins, setup, loop, ISR-style encoders, PWM motors, servo pulses, WiFi, MQTT, and compact telemetry packets.

