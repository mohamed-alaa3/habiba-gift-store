import { CommonModule, DatePipe } from '@angular/common';
import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, of, timeout } from 'rxjs';
import { TranslatePipe } from '@ngx-translate/core';

import { OrderService } from '../../../../../core/services/order.service';
import { ToastService } from '../../../../../core/services/toast.service';

import { Order, OrderStatus } from '../../../../../core/models';
import { LocalizedPipe } from '../../../../../shared/pipes/localized.pipe';
import { PricePipe } from '../../../../../shared/pipes/price.pipe';
import { SafeImagePipe } from '../../../../../shared/pipes/safe-image.pipe';
import { EmptyStateComponent } from '../../../../../shared/components/empty-state/empty-state.component';
import { LoaderComponent } from '../../../../../shared/components/loader/loader.component';

type LoadState = 'loading' | 'success' | 'error';

const FETCH_TIMEOUT_MS = 8000;

@Component({
  selector: 'app-admin-order-details',
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
    RouterLink,
    TranslatePipe,
    LocalizedPipe,
    PricePipe,
    SafeImagePipe,
    EmptyStateComponent,
    LoaderComponent,
  ],
  templateUrl: './order-details.component.html',
  styleUrl: './order-details.component.scss',
})
export class AdminOrderDetailsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private orderService = inject(OrderService);
  private toast = inject(ToastService);
  private destroyRef = inject(DestroyRef);

  protected readonly state = signal<LoadState>('loading');
  protected readonly order = signal<Order | null>(null);
  protected readonly updatingStatus = signal(false);

  protected readonly statusOptions: OrderStatus[] = [
    'pending',
    'confirmed',
    'processing',
    'shipped',
    'delivered',
    'cancelled',
  ];

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.state.set('error');
      return;
    }
    this.load(id);
  }

  protected load(id: string): void {
    this.state.set('loading');

    this.orderService
      .getById(id)
      .pipe(
        timeout(FETCH_TIMEOUT_MS),
        catchError(() => of(null)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((res) => {
        if (!res?.success || !res.data) {
          this.state.set('error');
          return;
        }
        this.order.set(res.data);
        this.state.set('success');
      });
  }

  protected updateStatus(newStatus: OrderStatus): void {
    const o = this.order();
    if (!o || o.status === newStatus || this.updatingStatus()) return;

    this.updatingStatus.set(true);

    this.orderService
      .updateStatus(o._id, { status: newStatus })
      .pipe(
        timeout(FETCH_TIMEOUT_MS),
        catchError(() => of(null)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((res) => {
        this.updatingStatus.set(false);
        if (res?.success) {
          this.order.set(res.data);
          this.toast.success('Order status updated');
        }
      });
  }

  protected onStatusChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value as OrderStatus;
    this.updateStatus(value);
  }

  protected statusClass(status: OrderStatus): string {
    return `is-${status}`;
  }

  protected customerName(o: Order): string {
    const u = o.user;
    if (u && typeof u === 'object' && 'name' in u) {
      return (u as { name: string }).name || 'Guest';
    }
    return o.shippingAddress?.fullName || 'Guest';
  }

  protected customerEmail(o: Order): string {
    const u = o.user;
    if (u && typeof u === 'object' && 'email' in u) {
      return (u as { email: string }).email || '';
    }
    return '';
  }
}
