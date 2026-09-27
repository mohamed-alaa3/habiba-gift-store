import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-habiba-promise',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslatePipe],
  templateUrl: './habiba-promise.component.html',
  styleUrl: './habiba-promise.component.scss',
})
export class HabibaPromiseComponent {
  protected readonly image = 'assets/images/promise/habiba-promise.jpg';
}
