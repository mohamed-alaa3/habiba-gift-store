import {
  Directive,
  ElementRef,
  Inject,
  OnDestroy,
  OnInit,
  inject,
  input,
  PLATFORM_ID,
} from '@angular/core';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';

/**
 * Reveals an element with a smooth animation when it enters the viewport.
 * Uses IntersectionObserver — lightweight and performant.
 *
 * Usage:
 *   <div appRevealOnScroll>...</div>
 *   <div appRevealOnScroll variant="from-start" [delay]="200">...</div>
 *   <div appRevealOnScroll [stagger]="true">...children get staggered</div>
 */
@Directive({
  selector: '[appRevealOnScroll]',
  standalone: true,
})
export class RevealOnScrollDirective implements OnInit, OnDestroy {
  private el = inject(ElementRef<HTMLElement>);
  private doc = inject(DOCUMENT);

  readonly variant = input<'fade' | 'up' | 'from-start' | 'from-end' | 'scale'>('up');
  readonly delay = input<number>(0);
  readonly threshold = input<number>(0.15);
  readonly once = input<boolean>(true);
  readonly stagger = input<boolean>(false);

  private observer: IntersectionObserver | null = null;
  private reducedMotion = false;

  constructor(@Inject(PLATFORM_ID) private platformId: object) {}

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      // SSR — just mark visible immediately
      this.el.nativeElement.classList.add('is-visible');
      return;
    }

    this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const node = this.el.nativeElement;
    node.classList.add('reveal');

    // Variant class
    const v = this.variant();
    if (v === 'from-start') node.classList.add('reveal-from-start');
    if (v === 'from-end') node.classList.add('reveal-from-end');
    if (v === 'scale') node.classList.add('reveal-scale');
    // 'up' is the default `reveal` behavior

    // Stagger children
    if (this.stagger()) {
      node.classList.add('stagger-children');
    }

    // Reduced motion → reveal immediately
    if (this.reducedMotion) {
      node.classList.add('is-visible');
      return;
    }

    // IntersectionObserver
    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const d = Math.max(0, this.delay());
            if (d > 0) {
              window.setTimeout(() => {
                entry.target.classList.add('is-visible');
              }, d);
            } else {
              entry.target.classList.add('is-visible');
            }

            if (this.once()) {
              this.observer?.unobserve(entry.target);
            }
          } else if (!this.once()) {
            entry.target.classList.remove('is-visible');
          }
        });
      },
      {
        threshold: this.threshold(),
        rootMargin: '0px 0px -40px 0px',
      },
    );

    this.observer.observe(node);
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }
}
