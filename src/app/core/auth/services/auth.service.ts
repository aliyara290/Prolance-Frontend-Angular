import { inject, Injectable } from '@angular/core';
import Keycloak from 'keycloak-js';
import { ConfigService } from '../../config/config.service';
import { createKeycloakInstance } from '../keycloak.config';
import { TokenPayload } from '../models/token-payload.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly configService = inject(ConfigService);
  private keycloak: Keycloak | null = null;

  async initKeycloak(): Promise<boolean> {
    const config = this.configService.value;
    this.keycloak = createKeycloakInstance(config);

    try {
      const authenticated = await this.keycloak.init({
        onLoad: 'check-sso',
        silentCheckSsoRedirectUri: window.location.origin + '/assets/silent-check-sso.html',
        pkceMethod: 'S256',
        checkLoginIframe: false
      });
      return authenticated;
    } catch (error) {
      console.error('Keycloak init failed', error);
      return false;
    }
  }

  login(): Promise<void> {
    if (!this.keycloak) {
      return Promise.reject('Keycloak not initialized');
    }
    return this.keycloak.login();
  }

  register(): Promise<void> {
    if (!this.keycloak) {
      return Promise.reject('Keycloak not initialized');
    }
    return this.keycloak.register();
  }

  logout(): Promise<void> {
    if (!this.keycloak) {
      return Promise.reject('Keycloak not initialized');
    }
    return this.keycloak.logout({
      redirectUri: window.location.origin
    });
  }

  getToken(): string | null {
    return this.keycloak?.token || null;
  }

  getParsedToken(): TokenPayload | null {
    if (!this.keycloak?.tokenParsed) {
      return null;
    }
    return this.keycloak.tokenParsed as unknown as TokenPayload;
  }

  async updateToken(minValidity: number = 30): Promise<boolean> {
    if (!this.keycloak || !this.keycloak.token) {
      return false;
    }
    try {
      return await this.keycloak.updateToken(minValidity);
    } catch (error) {
      console.error('Failed to refresh token', error);
      await this.logout();
      return false;
    }
  }

  hasTenantId(): boolean {
    const parsed = this.getParsedToken();
    return !!(parsed?.tenant_id || parsed?.tenantId);
  }
}
