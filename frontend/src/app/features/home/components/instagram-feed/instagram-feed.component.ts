import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

export interface InstagramPost {
  id: string;
  image: string;
  alt: string;
  url: string;
}

@Component({
  selector: 'app-instagram-feed',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './instagram-feed.component.html',
  styleUrl: './instagram-feed.component.scss',
})
export class InstagramFeedComponent {
  protected readonly profileUrl = 'https://instagram.com/habibastore';

  protected readonly posts: InstagramPost[] = [
    {
      id: 'ig-1',
      image: 'assets/images/instagram/ig-1.jpg',
      alt: 'Wrapped gift with kraft paper and ribbon',
      url: 'https://instagram.com/p/1',
    },
    {
      id: 'ig-2',
      image: 'assets/images/instagram/ig-2.jpg',
      alt: 'Gift box with ribbon on wooden table',
      url: 'https://instagram.com/p/2',
    },
    {
      id: 'ig-3',
      image: 'assets/images/instagram/ig-3.jpg',
      alt: 'Christmas gift wrapping inspiration',
      url: 'https://instagram.com/p/3',
    },
    {
      id: 'ig-4',
      image: 'assets/images/instagram/ig-4.jpg',
      alt: 'Person holding a gift wrapped in red paper',
      url: 'https://instagram.com/p/4',
    },
  ];
}
