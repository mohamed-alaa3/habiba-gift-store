import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, input } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, of, timeout } from 'rxjs';

import { Product } from '../../../../core/models';
import { ProductCardComponent } from '../../../../shared/components/product-card/product-card.component';
import { RevealOnScrollDirective } from '../../../../shared/directives/reveal-on-scroll.directive';
import { CartService } from '../../../../core/services/cart.service';
import { WishlistService } from '../../../../core/services/wishlist.service';
import { AuthStore } from '../../../../core/stores/auth.store';
import { ToastService } from '../../../../core/services/toast.service';

const FETCH_TIMEOUT_MS = 8000;

@Component({
  selector: 'app-product-grid',
  standalone: true,
  imports: [CommonModule, ProductCardComponent, RevealOnScrollDirective],
  template: `
    <div class="product-grid stagger-children" role="list" appRevealOnScroll [stagger]="true">
      @for (product of products(); track product._id) {
        <div class="product-grid__item" role="listitem">
          <app-product-card
            [product]="product"
            (addToCart)="onAddToCart($event)"
            (toggleWishlist)="onToggleWishlist($event)"
          />
        </div>
      }
    </div>
  `,
  styles: [
    `
      .product-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 1rem;
      }
      @media (min-width: 640px) {
        .product-grid {
          gap: 1.25rem;
        }
      }
      @media (min-width: 1024px) {
        .product-grid {
          grid-template-columns: repeat(2, 1fr);
          gap: 1.5rem;
        }
      }
      @media (min-width: 1280px) {
        .product-grid {
          grid-template-columns: repeat(3, 1fr);
        }
      }
    `,
  ],
})
export class ProductGridComponent {
  private cartService = inject(CartService);
  private wishlistService = inject(WishlistService);
  private authStore = inject(AuthStore);
  private toast = inject(ToastService);
  private destroyRef = inject(DestroyRef);

  readonly products = input<Product[]>([]);

  protected onAddToCart(product: Product): void {
    if (!this.authStore.isAuthenticated()) {
      this.toast.info('Please sign in to add items to your cart.');
      return;
    }

    this.cartService
      .add({ productId: product._id, quantity: 1, selectedOptions: [] })
      .pipe(
        timeout(FETCH_TIMEOUT_MS),
        catchError(() => of(null)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((res) => {
        if (res?.success) {
          this.toast.success('Added to cart');
        }
      });
  }

  protected onToggleWishlist(product: Product): void {
    if (!this.authStore.isAuthenticated()) {
      this.toast.info('Please sign in to save items to your wishlist.');
      return;
    }

    this.wishlistService
      .add(product._id)
      .pipe(
        timeout(FETCH_TIMEOUT_MS),
        catchError(() => of(null)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((res) => {
        if (res?.success) {
          this.toast.success('Added to wishlist');
        }
      });
  }
}
