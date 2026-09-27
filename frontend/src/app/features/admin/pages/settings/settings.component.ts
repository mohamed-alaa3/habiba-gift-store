import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-admin-settings',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  template: `
    <div class="admin-settings">
      <header class="admin-settings__header">
        <h1 class="admin-settings__title">{{ 'admin.settings.title' | translate }}</h1>
        <p class="admin-settings__subtitle">{{ 'admin.settings.subtitle' | translate }}</p>
      </header>

      <div class="admin-settings__card">
        <div class="admin-settings__icon" aria-hidden="true">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path
              d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"
            />
            <circle cx="12" cy="12" r="3" />
          </svg>
        </div>

        <span class="admin-settings__badge">{{ 'common.comingSoon' | translate }}</span>

        <h2 class="admin-settings__card-title">{{ 'admin.settings.comingSoon' | translate }}</h2>
        <p class="admin-settings__card-text">{{ 'admin.settings.comingSoonText' | translate }}</p>
      </div>
    </div>
  `,
  styles: [
    `
      .admin-settings {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }
      .admin-settings__header {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
      }
      .admin-settings__title {
        font-family: 'Poppins', system-ui, sans-serif;
        font-size: clamp(1.25rem, 2vw + 0.5rem, 1.75rem);
        font-weight: 700;
        color: var(--text);
        margin: 0;
      }
      .admin-settings__subtitle {
        font-size: 0.9375rem;
        color: var(--text-muted);
        margin: 0;
      }
      .admin-settings__card {
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        gap: 0.75rem;
        padding: 3rem 1.5rem;
        background-color: var(--surface);
        border: 1px dashed var(--border-strong);
        border-radius: var(--radius-xl);
        max-width: 520px;
        margin-inline: auto;
      }
      .admin-settings__icon {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 72px;
        height: 72px;
        border-radius: 9999px;
        background-color: var(--brand-primary-soft);
        color: var(--brand-primary);
        margin-bottom: 0.25rem;
      }
      .admin-settings__badge {
        display: inline-flex;
        padding: 0.25rem 0.75rem;
        font-size: 0.6875rem;
        font-weight: 700;
        letter-spacing: 0.1em;
        text-transform: uppercase;
        color: var(--brand-primary);
        background-color: var(--brand-primary-soft);
        border-radius: 9999px;
      }
      .admin-settings__card-title {
        font-family: 'Poppins', system-ui, sans-serif;
        font-size: 1.125rem;
        font-weight: 600;
        color: var(--text);
        margin: 0;
      }
      .admin-settings__card-text {
        font-size: 0.9375rem;
        color: var(--text-muted);
        margin: 0;
        max-width: 42ch;
        line-height: 1.5;
      }
    `,
  ],
})
export class AdminSettingsComponent {}
