import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-marketing-navbar',
  standalone: true,
  imports: [RouterLink],
  templateUrl: "marketing-navbar.component.html"
})
export class MarketingNavbarComponent {}
