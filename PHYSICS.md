# Physics

## Differential Drive

The OSOYOO-style robot is modeled as a differential drive platform with wheel radius `r`, track width `L`, left wheel angular velocity `omega_L`, and right wheel angular velocity `omega_R`.

```text
v = r / 2 * (omega_R + omega_L)
omega = r / L * (omega_R - omega_L)
dx = v * cos(theta) * dt
dy = v * sin(theta) * dt
dtheta = omega * dt
```

Configured values:

```text
r = 0.033 m
L = 0.142 m
max wheel speed = 300 RPM = 31.416 rad/s
max linear speed = 0.033 * 31.416 = 1.037 m/s
mass = 0.8 kg
I = 0.004 kg m^2
```

## PID Controller

The discrete PID controller computes:

```text
error[k] = setpoint[k] - measurement[k]
integral[k] = integral[k - 1] + error[k] * dt
derivative[k] = (error[k] - error[k - 1]) / dt
output[k] = Kp * error[k] + Ki * integral[k] + Kd * derivative[k]
```

Anti-windup clamps the integral when the output saturates. The derivative channel is low-pass filtered:

```text
D_filtered[k] = alpha * D_filtered[k - 1] + (1 - alpha) * D_raw[k]
```

This approximates a discrete filtered derivative term in the Z domain:

```text
D(z) = Kd * (1 - z^-1) / dt
Filtered D(z) = (1 - alpha) * D(z) / (1 - alpha * z^-1)
```

## Wheel Slip

The friction limit is:

```text
F_max = mu * m * g
a_max = F_max / m = mu * g
```

When commanded acceleration exceeds `mu * g`, the drive marks both wheels as slipping and reduces effective linear velocity. The visual layer can show wheel spin while the robot body advances more slowly.

## Payload Center of Gravity

The combined center of gravity is a mass-weighted average:

```text
CoG = (m_robot * CoG_robot + m_payload * CoG_payload) / (m_robot + m_payload)
tippingRisk = abs(CoG.x) / supportHalfLength
```

The result is normalized to `0..1` for dashboard display and maintenance alerts.

