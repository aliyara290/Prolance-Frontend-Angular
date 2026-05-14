export interface AppConfig {
  environment: 'development' | 'staging' | 'production';
  apiGatewayUrl: string;
  keycloakUrl: string;
  keycloakRealm: string;
  keycloakClientId: string;
  enableDebug: boolean;
}
