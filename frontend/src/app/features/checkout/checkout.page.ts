import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, of, timeout } from 'rxjs';
import { TranslatePipe } from '@ngx-translate/core';

import { CartService } from '../../core/services/cart.service';
import { OrderService } from '../../core/services/order.service';
import { AddressService } from '../../core/services/address.service';
import { CartStore } from '../../core/stores/cart.store';
import { AuthStore } from '../../core/stores/auth.store';
import { ToastService } from '../../core/services/toast.service';

import { Address, AddressSnapshot, CreateOrderPayload, Order } from '../../core/models';
import { LocalizedPipe } from '../../shared/pipes/localized.pipe';
import { PricePipe } from '../../shared/pipes/price.pipe';
import { SafeImagePipe } from '../../shared/pipes/safe-image.pipe';
import { LoaderComponent } from '../../shared/components/loader/loader.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { InputComponent } from '../../shared/components/input/input.component';
import { TextareaComponent } from '../../shared/components/textarea/textarea.component';
import {
  CheckoutStepIndicatorComponent,
  CheckoutStep,
} from './components/step-indicator/step-indicator.component';
import { CheckoutOrderReviewComponent } from './components/order-review/order-review.component';
import { CheckoutOrderConfirmationComponent } from './components/order-confirmation/order-confirmation.component';

type LoadState = 'loading' | 'ready' | 'empty' | 'error';
type FlowState = 'form' | 'submitting' | 'confirmed';

const FETCH_TIMEOUT_MS = 10000;

@Component({
  selector: 'app-checkout-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    TranslatePipe,
    LocalizedPipe,
    PricePipe,
    SafeImagePipe,
    LoaderComponent,
    EmptyStateComponent,
    InputComponent,
    TextareaComponent,
    CheckoutStepIndicatorComponent,
    CheckoutOrderReviewComponent,
    CheckoutOrderConfirmationComponent,
  ],
  templateUrl: './checkout.page.html',
  styleUrl: './checkout.page.scss',
})
export class CheckoutPage implements OnInit {
  private fb = inject(FormBuilder);
  private cartService = inject(CartService);
  private orderService = inject(OrderService);
  private addressService = inject(AddressService);
  private cartStore = inject(CartStore);
  private authStore = inject(AuthStore);
  private toast = inject(ToastService);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  // ---------- State ----------
  protected readonly loadState = signal<LoadState>('loading');
  protected readonly flowState = signal<FlowState>('form');
  protected readonly currentStep = signal<CheckoutStep>('information');
  protected readonly submitting = signal(false);

  // Cart data (includes product + gift-box items)
  protected readonly cart = this.cartStore.cart;
  protected readonly items = computed(() => this.cartStore.items());
  protected readonly subtotal = this.cartStore.subtotal;
  protected readonly hasUnavailable = this.cartStore.hasUnavailable;

  // Addresses
  protected readonly savedAddresses = signal<Address[]>([]);
  protected readonly selectedAddressId = signal<string | null>(null);

  // Order confirmation
  protected readonly createdOrder = signal<Order | null>(null);

  // ---------- Computed ----------
  protected readonly canPlaceOrder = computed(
    () => !this.hasUnavailable() && this.items().length > 0,
  );

  // ---------- Form ----------
  protected readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    fullName: ['', [Validators.required, Validators.minLength(2)]],
    phone: ['', [Validators.required]],
    country: ['', [Validators.required]],
    city: ['', [Validators.required]],
    area: [''],
    street: ['', [Validators.required]],
    building: [''],
    apartment: [''],
    postalCode: [''],
    notes: [''],
  });

  ngOnInit(): void {
    if (!this.authStore.isAuthenticated()) {
      this.router.navigate(['/auth/login'], {
        queryParams: { redirect: '/checkout' },
      });
      return;
    }

    // Prefill from user
    const user = this.authStore.user();
    if (user?.email) this.form.patchValue({ email: user.email });
    if (user?.name) this.form.patchValue({ fullName: user.name });
    if (user?.phone) this.form.patchValue({ phone: user.phone });

    this.loadCart();
    this.loadAddresses();
  }

  // ---------- Loaders ----------

  private loadCart(): void {
    this.loadState.set('loading');

    this.cartService
      .get()
      .pipe(
        timeout(FETCH_TIMEOUT_MS),
        catchError(() => of(null)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((res) => {
        if (!res || !res.success) {
          this.loadState.set('error');
          return;
        }
        const hasItems = (res.data.items?.length ?? 0) > 0;
        this.loadState.set(hasItems ? 'ready' : 'empty');
      });
  }

  private loadAddresses(): void {
    this.addressService
      .list()
      .pipe(
        timeout(FETCH_TIMEOUT_MS),
        catchError(() => of(null)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((res) => {
        if (!res?.success) return;
        this.savedAddresses.set(res.data ?? []);

        const def = res.data?.find((a) => a.isDefault);
        if (def) this.applyAddress(def);
      });
  }

  protected applyAddress(address: Address): void {
    this.selectedAddressId.set(address._id);
    this.form.patchValue({
      fullName: address.fullName,
      phone: address.phone,
      country: address.country,
      city: address.city,
      area: address.area || '',
      street: address.street,
      building: address.building || '',
      apartment: address.apartment || '',
      postalCode: address.postalCode || '',
    });
  }

  // ---------- Form helpers ----------

  protected showError(field: keyof typeof this.form.controls): boolean {
    const c = this.form.controls[field];
    return c.touched && c.invalid;
  }

  protected errorFor(field: string): string {
    const c = (this.form.controls as Record<string, any>)[field];
    if (!c || !c.errors) return '';
    if (c.errors['required']) return 'This field is required';
    if (c.errors['email']) return 'Please enter a valid email';
    if (c.errors['minlength']) return 'Value is too short';
    return 'Invalid value';
  }

  // ---------- Actions ----------

  protected continueToReview(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.currentStep.set('review');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  protected backToInformation(): void {
    this.currentStep.set('information');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  protected placeOrder(): void {
    if (this.form.invalid || !this.canPlaceOrder() || this.submitting()) return;

    this.submitting.set(true);
    this.flowState.set('submitting');

    const v = this.form.getRawValue();
    const shippingAddress: AddressSnapshot = {
      fullName: v.fullName,
      phone: v.phone,
      country: v.country,
      city: v.city,
      area: v.area,
      street: v.street,
      building: v.building,
      apartment: v.apartment,
      postalCode: v.postalCode,
    };

    // Gift box now lives inside the cart — no separate payload needed
    const payload: CreateOrderPayload = {
      shippingAddress,
      notes: v.notes || undefined,
    };

    this.orderService
      .create(payload)
      .pipe(
        timeout(FETCH_TIMEOUT_MS),
        catchError(() => of(null)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((res) => {
        this.submitting.set(false);
        if (!res || !res.success || !res.data) {
          this.flowState.set('form');
          return;
        }

        this.createdOrder.set(res.data);
        this.flowState.set('confirmed');
        this.cartStore.clear();

        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
  }

  protected retry(): void {
    this.loadCart();
  }
}
