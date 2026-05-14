import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export interface AppConfig {
  apiGatewayUrl: string;
  keycloakUrl: string;
  keycloakRealm: string;
  keycloakClientId: string;
}

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  private readonly http = inject(HttpClient);

  private config!: AppConfig;

  async load(): Promise<void> {
    this.config = await firstValueFrom(
      this.http.get<AppConfig>('assets/config/config.json')
    );
  }

  get value(): AppConfig {
    return this.config;
  }
}
