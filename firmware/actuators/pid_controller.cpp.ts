/**
 * Firmware-style PID single-step mirror.
 */

export interface FirmwarePIDState {
  readonly integral: number;
  readonly previousError: number;
}

export interface FirmwarePIDResult {
  readonly output: number;
  readonly state: FirmwarePIDState;
}

/** Compute one firmware-style PID step. */
export const firmwarePidStep = (
  setpoint: number,
  measurement: number,
  state: FirmwarePIDState,
  dtSeconds: number
): FirmwarePIDResult => {
  const error = setpoint - measurement;
  const integral = state.integral + error * dtSeconds;
  const derivative = (error - state.previousError) / Math.max(dtSeconds, 0.000001);
  return {
    output: 2.5 * error + 0.05 * integral + 0.2 * derivative,
    state: { integral, previousError: error }
  };
};

