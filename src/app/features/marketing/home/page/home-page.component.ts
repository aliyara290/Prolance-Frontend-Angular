import { Component } from '@angular/core';
import { MarketingNavbarComponent } from '../components/marketing-navbar/marketing-navbar.component';
import { MarketingHeroComponent } from '../components/marketing-hero/marketing-hero.component';
import { MarketingFeaturesComponent } from '../components/marketing-features/marketing-features.component';
import { MarketingTestimonialsComponent } from '../components/marketing-testimonials/marketing-testimonials.component';
import { MarketingCtaComponent } from '../components/marketing-cta/marketing-cta.component';
import { MarketingFooterComponent } from '../components/marketing-footer/marketing-footer.component';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [
    MarketingNavbarComponent,
    MarketingHeroComponent,
    MarketingFeaturesComponent,
    MarketingTestimonialsComponent,
    MarketingCtaComponent,
    MarketingFooterComponent
  ],
  templateUrl: "home-page.component.html"

})
export class HomePageComponent {}
