/**
 * Firmware-style MQTT client connection mirror.
 */

export interface FirmwareMQTTConnection {
  readonly clientId: string;
  readonly connected: boolean;
}

/** Create a firmware-style MQTT connection snapshot. */
export const connectMqtt = (clientId: string): FirmwareMQTTConnection => ({
  clientId,
  connected: clientId.length > 0
});

