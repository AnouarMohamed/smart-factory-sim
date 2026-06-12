/**
 * Firmware-style WiFi connection state mirror.
 */

export type WiFiState = 'DISCONNECTED' | 'CONNECTING' | 'CONNECTED';

/** Return connected state when credentials are present. */
export const connectWiFi = (ssid: string): WiFiState => (ssid.length > 0 ? 'CONNECTED' : 'DISCONNECTED');

