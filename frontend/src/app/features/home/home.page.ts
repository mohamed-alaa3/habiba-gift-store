import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

import { RevealOnScrollDirective } from '../../shared/directives/reveal-on-scroll.directive';
import { HeroComponent } from './components/hero/hero.component';
import { ShopByCategoryComponent } from './components/shop-by-category/shop-by-category.component';
import { BestSellersComponent } from './components/best-sellers/best-sellers.component';
import { HabibaPromiseComponent } from './components/habiba-promise/habiba-promise.component';
import { InstagramFeedComponent } from './components/instagram-feed/instagram-feed.component';
import { NewsletterCtaComponent } from './components/newsletter-cta/newsletter-cta.component';
import { TrustBadgesComponent } from './components/trust-badges/trust-badges.component';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [
    CommonModule,
    RevealOnScrollDirective,
    HeroComponent,
    ShopByCategoryComponent,
    BestSellersComponent,
    TrustBadgesComponent,
    HabibaPromiseComponent,
    InstagramFeedComponent,
    NewsletterCtaComponent,
  ],
  template: `
    <app-hero />

    <div appRevealOnScroll variant="up">
      <app-shop-by-category />
    </div>

    <div appRevealOnScroll variant="up">
      <app-best-sellers />
    </div>

    <div appRevealOnScroll variant="up">
      <app-trust-badges />
    </div>

    <div appRevealOnScroll variant="up">
      <app-habiba-promise />
    </div>

    <div appRevealOnScroll variant="up">
      <app-instagram-feed />
    </div>

    <div appRevealOnScroll variant="up">
      <app-newsletter-cta />
    </div>
  `,
  styles: [``],
})
export class HomePage {}
