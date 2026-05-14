import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-marketing-hero',
  standalone: true,
  imports: [RouterLink],
  templateUrl: "marketing-hero.component.html"
})
export class MarketingHeroComponent {}
