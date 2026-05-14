import {Component, inject, signal} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {ConfigService} from './core/config/config.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  private readonly config = inject(ConfigService);
  protected readonly title = signal('Prolance-Frontend');

  public x = this.config.value.keycloakRealm;
}
