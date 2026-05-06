import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { EventsService } from '../../services/events.service';
import { EventDetail } from '../../models/event.model';

@Component({
  selector: 'app-event-detail-page',
  standalone: true,
  imports: [RouterLink, DatePipe],
  templateUrl: './event-detail-page.html',
  styleUrl: './event-detail-page.scss',
})
export class EventDetailPageComponent implements OnInit {
  private readonly eventsService = inject(EventsService);
  private readonly route = inject(ActivatedRoute);

  event = signal<EventDetail | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.eventsService.getEvent(id).subscribe({
      next: (event) => {
        this.event.set(event);
        this.loading.set(false);
      },
      error: (err: { message?: string }) => {
        this.error.set(err.message ?? 'Evento no encontrado');
        this.loading.set(false);
      },
    });
  }

  formatJson(data: unknown): string {
    return JSON.stringify(data, null, 2);
  }
}
