import {Component, inject, signal} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {ConfigService} from './core/config/config.service';
import { ConfirmModalComponent } from './shared/ui/confirm-modal/confirm-modal.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ConfirmModalComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  private readonly config = inject(ConfigService);
  protected readonly title = signal('Prolance-Frontend');

  public x = this.config.value.keycloakRealm;
}
