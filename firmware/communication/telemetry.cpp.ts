/**
 * Firmware-style telemetry packet builder.
 */

export interface FirmwareTelemetryPacket {
  readonly robotId: string;
  readonly batterySoc: number;
  readonly state: string;
}

/** Build a compact telemetry packet. */
export const buildTelemetryPacket = (
  robotId: string,
  batterySoc: number,
  state: string
): FirmwareTelemetryPacket => ({
  robotId,
  batterySoc,
  state
});

