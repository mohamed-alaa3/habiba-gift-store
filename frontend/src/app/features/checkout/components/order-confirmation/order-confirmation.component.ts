import { CommonModule, DatePipe } from '@angular/common';
import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';

import { Order } from '../../../../core/models';
import { PricePipe } from '../../../../shared/pipes/price.pipe';

@Component({
  selector: 'app-checkout-order-confirmation',
  standalone: true,
  imports: [CommonModule, DatePipe, RouterLink, TranslatePipe, PricePipe],
  template: `
    <div class="confirmation">
      <div class="confirmation__icon" aria-hidden="true">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="40"
          height="40"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M20 6 9 17l-5-5" />
        </svg>
      </div>

      <h1 class="confirmation__title">{{ 'checkout.successTitle' | translate }}</h1>
      <p class="confirmation__subtitle">{{ 'checkout.successText' | translate }}</p>

      <div class="confirmation__card">
        <div class="confirmation__row">
          <span>{{ 'checkout.orderNumber' | translate }}</span>
          <strong>{{ order().orderNumber }}</strong>
        </div>
        <div class="confirmation__row">
          <span>{{ 'checkout.orderDate' | translate }}</span>
          <strong>{{ order().createdAt | date: 'medium' }}</strong>
        </div>
        <div class="confirmation__row">
          <span>{{ 'cart.total' | translate }}</span>
          <strong class="confirmation__total">{{ order().total | price }}</strong>
        </div>
        <div class="confirmation__row">
          <span>{{ 'checkout.status' | translate }}</span>
          <strong class="confirmation__status">{{ order().status }}</strong>
        </div>
      </div>

      <div class="confirmation__actions">
        <a routerLink="/shop" class="confirmation__btn confirmation__btn--primary">
          {{ 'cart.continueShopping' | translate }}
        </a>
        <a routerLink="/account/orders" class="confirmation__btn confirmation__btn--ghost">
          {{ 'checkout.viewOrders' | translate }}
        </a>
      </div>
    </div>
  `,
  styles: [
    `
      .confirmation {
        max-width: 560px;
        margin-inline: auto;
        padding: 3rem 1rem;
        text-align: center;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1rem;
      }

      .confirmation__icon {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 88px;
        height: 88px;
        border-radius: 9999px;
        background-color: var(--success-soft);
        color: var(--success);
        margin-bottom: 0.5rem;
      }

      .confirmation__title {
        font-family: 'Poppins', system-ui, sans-serif;
        font-size: clamp(1.5rem, 2.5vw + 0.5rem, 2rem);
        font-weight: 700;
        color: var(--text);
        margin: 0;
      }

      .confirmation__subtitle {
        font-size: 1rem;
        color: var(--text-muted);
        margin: 0;
        max-width: 42ch;
        line-height: 1.6;
      }

      .confirmation__card {
        width: 100%;
        padding: 1.25rem;
        background-color: var(--surface);
        border: 1px solid var(--border);
        border-radius: var(--radius-lg);
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
        margin-top: 1rem;
        text-align: start;
      }

      .confirmation__row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 1rem;
        font-size: 0.9375rem;
        color: var(--text-muted);

        strong {
          color: var(--text);
          font-family: 'Inter', system-ui, sans-serif;
          font-variant-numeric: tabular-nums;
        }
      }

      .confirmation__total {
        color: var(--brand-primary) !important;
        font-family: 'Poppins', system-ui, sans-serif !important;
        font-size: 1.125rem;
      }

      .confirmation__status {
        text-transform: capitalize;
      }

      .confirmation__actions {
        display: flex;
        flex-wrap: wrap;
        gap: 0.75rem;
        justify-content: center;
        margin-top: 1.5rem;
      }

      .confirmation__btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        height: 48px;
        padding-inline: 1.75rem;
        font-family: 'Inter', system-ui, sans-serif;
        font-size: 0.9375rem;
        font-weight: 600;
        border-radius: 9999px;
        text-decoration: none;
        transition: all var(--transition-base);
      }

      .confirmation__btn--primary {
        background-color: var(--brand-primary);
        color: #ffffff;
        border: 1.5px solid var(--brand-primary);
      }

      .confirmation__btn--primary:hover {
        background-color: var(--brand-primary-hover);
      }

      .confirmation__btn--ghost {
        background: transparent;
        color: var(--text);
        border: 1.5px solid var(--border-strong);
      }

      .confirmation__btn--ghost:hover {
        border-color: var(--brand-primary);
        color: var(--brand-primary);
      }
    `,
  ],
})
export class CheckoutOrderConfirmationComponent {
  readonly order = input.required<Order>();
}
