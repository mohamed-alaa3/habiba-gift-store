import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';

import { RevealOnScrollDirective } from '../../shared/directives/reveal-on-scroll.directive';

@Component({
  selector: 'app-not-found-page',
  standalone: true,
  imports: [RouterLink, TranslatePipe, RevealOnScrollDirective],
  template: `
    <main class="not-found-page" appRevealOnScroll [stagger]="true">
      <p class="code">404</p>
      <h1 class="title">{{ 'notFoundPage.title' | translate }}</h1>
      <a routerLink="/" class="home-link">{{ 'notFoundPage.backHome' | translate }}</a>
    </main>
  `,
  styles: [
    `
      .not-found-page {
        min-height: 100vh;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        text-align: center;
        gap: 1rem;
        padding: 2rem;
      }

      .code {
        font-size: clamp(4rem, 12vw, 8rem);
        font-family: 'Poppins', sans-serif;
        font-weight: 800;
        color: var(--brand-primary);
        line-height: 1;
      }

      .title {
        margin: 0;
      }

      .home-link {
        color: var(--brand-primary);
        font-weight: 500;
        text-decoration: underline;
      }
    `,
  ],
})
export class NotFoundPage {}