import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, of, timeout } from 'rxjs';
import { TranslatePipe } from '@ngx-translate/core';

import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { CartService } from '../../core/services/cart.service';
import { WishlistService } from '../../core/services/wishlist.service';

import { AuthPanelComponent } from './components/auth-panel/auth-panel.component';

const FETCH_TIMEOUT_MS = 10000;

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, TranslatePipe, AuthPanelComponent],
  templateUrl: './login.page.html',
  styleUrl: './auth.page.scss',
})
export class LoginPage {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private cartService = inject(CartService);
  private wishlistService = inject(WishlistService);
  private toast = inject(ToastService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private destroyRef = inject(DestroyRef);

  protected readonly submitting = signal(false);
  protected readonly passwordVisible = signal(false);

  protected readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  protected togglePasswordVisibility(): void {
    this.passwordVisible.update((v) => !v);
  }

  protected submit(): void {
    if (this.form.invalid || this.submitting()) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    const { email, password } = this.form.getRawValue();

    this.authService
      .login({ email, password })
      .pipe(
        timeout(FETCH_TIMEOUT_MS),
        catchError(() => of(null)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((res) => {
        this.submitting.set(false);
        if (!res?.success) return;

        this.toast.success('Welcome back!');
        this.prefetchUserData();
        this.redirectAfterAuth();
      });
  }

  private prefetchUserData(): void {
    this.cartService.get().subscribe({ error: () => {} });
    this.wishlistService.get().subscribe({ error: () => {} });
  }

  private redirectAfterAuth(): void {
    const redirect = this.route.snapshot.queryParamMap.get('redirect');
    this.router.navigate([redirect || '/']);
  }
}
