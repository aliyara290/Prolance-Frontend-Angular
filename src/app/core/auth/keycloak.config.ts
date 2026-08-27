import Keycloak from 'keycloak-js';
import { AppConfig } from '../config/app-config.model';

export function createKeycloakInstance(config: AppConfig): Keycloak {
  return new Keycloak({
    url: config.keycloakUrl,
    realm: config.keycloakRealm,
    clientId: config.keycloakClientId,
  });
}
