import { CommonModule } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

import { CartItem } from '../../../../core/models';
import { LocalizedPipe } from '../../../../shared/pipes/localized.pipe';
import { PricePipe } from '../../../../shared/pipes/price.pipe';
import { SafeImagePipe } from '../../../../shared/pipes/safe-image.pipe';

@Component({
  selector: 'app-checkout-order-review',
  standalone: true,
  imports: [CommonModule, TranslatePipe, LocalizedPipe, PricePipe, SafeImagePipe],
  template: `
    <section class="order-review">
      <!-- Cart + Gift Box Items -->
      @if (items().length > 0) {
        <div class="order-review__section">
          <h2 class="order-review__title">{{ 'checkout.reviewItems' | translate }}</h2>
          <ul class="order-review__list">
            @for (item of items(); track item._id) {
              <!-- ============================================ -->
              <!-- GIFT BOX ITEM -->
              <!-- ============================================ -->
              @if (item.type === 'gift-box' && item.giftBox) {
                <li class="order-review__item order-review__item--gift">
                  <div class="order-review__gift-header">
                    <div class="order-review__gift-icon" aria-hidden="true">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      >
                        <path
                          d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"
                        />
                        <path d="M3.3 7l8.7 5 8.7-5" />
                        <path d="M12 22V12" />
                      </svg>
                    </div>
                    <h3 class="order-review__gift-title">
                      {{ 'checkout.customGiftBox' | translate }}
                    </h3>
                    <span class="order-review__price">{{ item.lineTotal ?? 0 | price }}</span>
                  </div>

                  <!-- Box -->
                  <div class="order-review__gift-block">
                    <p class="order-review__gift-label">{{ 'giftBuilder.box' | translate }}</p>
                    <div class="order-review__gift-row">
                      <div class="order-review__gift-thumb">
                        @if (item.giftBox.boxImageUrl) {
                          <img
                            [src]="item.giftBox.boxImageUrl | safeImage"
                            [alt]="item.giftBox.boxName | localized"
                            class="img-fallback"
                          />
                        }
                      </div>
                      <p class="order-review__gift-name">
                        {{ item.giftBox.boxName | localized }}
                      </p>
                      <span class="order-review__gift-price">
                        {{ item.giftBox.boxPrice | price }}
                      </span>
                    </div>
                  </div>

                  <!-- Items -->
                  @if (item.giftBox.items.length > 0) {
                    <div class="order-review__gift-block">
                      <p class="order-review__gift-label">
                        {{ 'giftBuilder.items' | translate }} ({{ item.giftBox.items.length }})
                      </p>
                      @for (gi of item.giftBox.items; track gi.productId) {
                        <div class="order-review__gift-row">
                          <div class="order-review__gift-thumb">
                            @if (gi.imageUrl) {
                              <img
                                [src]="gi.imageUrl | safeImage"
                                [alt]="gi.name | localized"
                                class="img-fallback"
                              />
                            }
                          </div>
                          <p class="order-review__gift-name">{{ gi.name | localized }}</p>
                          <span class="order-review__gift-price">{{ gi.price | price }}</span>
                        </div>
                      }
                    </div>
                  }

                  <!-- Wrap -->
                  @if (item.giftBox.wrap; as w) {
                    <div class="order-review__gift-block">
                      <p class="order-review__gift-label">{{ 'giftBuilder.wrap' | translate }}</p>
                      <div class="order-review__gift-row">
                        <div class="order-review__gift-thumb">
                          @if (w.imageUrl) {
                            <img
                              [src]="w.imageUrl | safeImage"
                              [alt]="w.name | localized"
                              class="img-fallback"
                            />
                          }
                        </div>
                        <p class="order-review__gift-name">{{ w.name | localized }}</p>
                        <span class="order-review__gift-price">{{ w.price | price }}</span>
                      </div>
                    </div>
                  }

                  <!-- Ribbon -->
                  @if (item.giftBox.ribbon; as r) {
                    <div class="order-review__gift-block">
                      <p class="order-review__gift-label">{{ 'giftBuilder.ribbon' | translate }}</p>
                      <div class="order-review__gift-row">
                        <span
                          class="order-review__gift-color"
                          [style.background-color]="r.color"
                        ></span>
                        <p class="order-review__gift-name">{{ r.name | localized }}</p>
                        <span class="order-review__gift-price">{{ r.price | price }}</span>
                      </div>
                    </div>
                  }

                  <!-- Note -->
                  @if (item.giftBox.note) {
                    <div class="order-review__gift-block">
                      <p class="order-review__gift-label">{{ 'giftBuilder.note' | translate }}</p>
                      <p class="order-review__gift-note">{{ item.giftBox.note }}</p>
                    </div>
                  }
                </li>
              } @else {
                <!-- ============================================ -->
                <!-- REGULAR PRODUCT ITEM -->
                <!-- ============================================ -->
                <li class="order-review__item">
                  <div class="order-review__media">
                    @if (item.product?.imageUrl) {
                      <img
                        [src]="item.product!.imageUrl | safeImage"
                        [alt]="item.product!.name | localized"
                        class="order-review__image img-fallback"
                      />
                    } @else {
                      <div class="order-review__image img-fallback" aria-hidden="true"></div>
                    }
                  </div>
                  <div class="order-review__info">
                    <p class="order-review__name">
                      {{ item.product ? (item.product.name | localized) : 'Item' }}
                    </p>
                    @if (item.selectedOptions.length > 0) {
                      <p class="order-review__options">
                        @for (opt of item.selectedOptions; track opt.name.en; let last = $last) {
                          <span>{{ opt.name | localized }}: {{ opt.value | localized }}</span>
                          @if (!last) {
                            <span>, </span>
                          }
                        }
                      </p>
                    }
                    <p class="order-review__qty">
                      {{ 'checkout.qty' | translate }}: {{ item.quantity }}
                    </p>
                  </div>
                  <span class="order-review__price">{{ item.lineTotal ?? 0 | price }}</span>
                </li>
              }
            }
          </ul>
        </div>
      }

      <!-- Shipping -->
      <div class="order-review__section">
        <h2 class="order-review__title">{{ 'checkout.reviewShipping' | translate }}</h2>
        <div class="order-review__address">
          <p class="order-review__address-name">{{ address().fullName }}</p>
          <p class="order-review__address-line">
            {{ address().street }}{{ address().building ? ', ' + address().building : ''
            }}{{ address().apartment ? ', ' + address().apartment : '' }}
          </p>
          <p class="order-review__address-line">
            {{ address().area ? address().area + ', ' : '' }}{{ address().city }},
            {{ address().country }}
          </p>
          @if (address().postalCode) {
            <p class="order-review__address-line">
              {{ 'checkout.postalCode' | translate }}: {{ address().postalCode }}
            </p>
          }
          <p class="order-review__address-line">{{ address().phone }}</p>
        </div>
      </div>

      <!-- Notes -->
      @if (notes()) {
        <div class="order-review__section">
          <h2 class="order-review__title">{{ 'checkout.reviewNotes' | translate }}</h2>
          <p class="order-review__notes">{{ notes() }}</p>
        </div>
      }
    </section>
  `,
  styles: [
    `
      .order-review {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }

      .order-review__section {
        padding: 1.5rem;
        background-color: var(--surface);
        border: 1px solid var(--border);
        border-radius: var(--radius-lg);
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }

      .order-review__title {
        font-family: 'Poppins', sans-serif;
        font-size: 1rem;
        font-weight: 700;
        color: var(--text);
        margin: 0;
      }

      .order-review__list {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
      }

      // ---------- Gift box item ----------
      .order-review__item--gift {
        flex-direction: column;
        align-items: stretch;
        gap: 0.75rem;
        padding: 1rem;
        background: linear-gradient(135deg, var(--brand-primary-soft) 0%, var(--surface) 100%);
        border: 1px solid var(--brand-primary);
        border-radius: var(--radius-lg);
      }

      .order-review__gift-header {
        display: flex;
        align-items: center;
        gap: 0.75rem;
      }

      .order-review__gift-icon {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 36px;
        height: 36px;
        border-radius: var(--radius-md);
        background-color: var(--brand-primary);
        color: #ffffff;
        flex-shrink: 0;
      }

      .order-review__gift-title {
        flex: 1;
        font-family: 'Poppins', sans-serif;
        font-size: 0.9375rem;
        font-weight: 700;
        color: var(--brand-primary);
        margin: 0;
        text-transform: uppercase;
        letter-spacing: 0.06em;
      }

      .order-review__gift-block {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        padding-block: 0.625rem;
        border-top: 1px dashed color-mix(in srgb, var(--brand-primary) 30%, transparent);

        &:first-of-type {
          border-top: none;
          padding-top: 0;
        }
      }

      .order-review__gift-label {
        font-family: 'Inter', sans-serif;
        font-size: 0.625rem;
        font-weight: 700;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: var(--brand-primary);
        margin: 0;
      }

      .order-review__gift-row {
        display: flex;
        align-items: center;
        gap: 0.75rem;
      }

      .order-review__gift-thumb {
        width: 36px;
        height: 36px;
        border-radius: var(--radius-md);
        overflow: hidden;
        flex-shrink: 0;
        background-color: var(--bg-muted);

        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
      }

      .order-review__gift-color {
        width: 22px;
        height: 22px;
        border-radius: 50%;
        flex-shrink: 0;
        box-shadow: inset 0 0 0 2px rgba(0, 0, 0, 0.08);
      }

      .order-review__gift-name {
        flex: 1;
        font-size: 0.875rem;
        font-weight: 600;
        color: var(--text);
        margin: 0;
      }

      .order-review__gift-price {
        font-family: 'Poppins', sans-serif;
        font-size: 0.8125rem;
        font-weight: 700;
        color: var(--text);
        font-variant-numeric: tabular-nums;
      }

      .order-review__gift-note {
        font-size: 0.8125rem;
        color: var(--text);
        line-height: 1.6;
        margin: 0;
        padding: 0.625rem 0.875rem;
        background-color: var(--surface);
        border-radius: var(--radius-md);
        white-space: pre-wrap;
        font-style: italic;
      }

      // ---------- Regular item ----------
      .order-review__item {
        display: flex;
        align-items: center;
        gap: 0.75rem;
      }

      .order-review__media {
        width: 64px;
        height: 64px;
        border-radius: var(--radius-md);
        overflow: hidden;
        flex-shrink: 0;
        background-color: var(--bg-muted);
      }

      .order-review__image {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
      }

      .order-review__info {
        flex: 1;
        min-width: 0;
      }

      .order-review__name {
        font-family: 'Inter', sans-serif;
        font-size: 0.9375rem;
        font-weight: 600;
        color: var(--text);
        margin: 0;
      }

      .order-review__options {
        font-size: 0.75rem;
        color: var(--text-subtle);
        margin: 0.125rem 0;
      }

      .order-review__qty {
        font-size: 0.75rem;
        color: var(--text-muted);
        margin: 0.125rem 0 0;
      }

      .order-review__price {
        font-family: 'Poppins', sans-serif;
        font-size: 0.9375rem;
        font-weight: 700;
        color: var(--text);
        font-variant-numeric: tabular-nums;
        flex-shrink: 0;
      }

      // ---------- Address ----------
      .order-review__address {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
      }

      .order-review__address-name {
        font-weight: 600;
        color: var(--text);
        margin: 0;
      }

      .order-review__address-line {
        font-size: 0.875rem;
        color: var(--text-muted);
        margin: 0;
      }

      .order-review__notes {
        font-size: 0.9375rem;
        line-height: 1.6;
        color: var(--text);
        margin: 0;
        white-space: pre-wrap;
      }
    `,
  ],
})
export class CheckoutOrderReviewComponent {
  readonly items = input<CartItem[]>([]);
  readonly address = input<{
    fullName: string;
    phone: string;
    country: string;
    city: string;
    area: string;
    street: string;
    building: string;
    apartment: string;
    postalCode: string;
  }>({
    fullName: '',
    phone: '',
    country: '',
    city: '',
    area: '',
    street: '',
    building: '',
    apartment: '',
    postalCode: '',
  });
  readonly notes = input<string>('');
}
