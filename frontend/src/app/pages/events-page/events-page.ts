import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { Subscription } from 'rxjs';
import { EventsService } from '../../services/events.service';
import { GatewayService } from '../../services/gateway.service';
import { EventSummary, EventStats, EventFilters } from '../../models/event.model';

@Component({
  selector: 'app-events-page',
  standalone: true,
  imports: [RouterLink, FormsModule, DatePipe],
  templateUrl: './events-page.html',
  styleUrl: './events-page.scss',
})
export class EventsPageComponent implements OnInit, OnDestroy {
  private readonly eventsService = inject(EventsService);
  private readonly gatewayService = inject(GatewayService);

  events = signal<EventSummary[]>([]);
  stats = signal<EventStats | null>(null);
  loading = signal(false);
  error = signal<string | null>(null);
  readonly connected = this.gatewayService.connected;

  filters = {
    startDate: this.defaultStartDate(),
    endDate: '',
    eventType: '',
    source: '',
  };

  private sub?: Subscription;

  ngOnInit(): void {
    this.loadEvents();
    this.loadStats();
    this.gatewayService.connect();
    this.sub = this.gatewayService.onNewEvent.subscribe((event) => {
      this.events.update((list) => [event, ...list].slice(0, 1000));
    });
  }

  loadEvents(): void {
    this.loading.set(true);
    this.error.set(null);
    const filters: EventFilters = {
      startDate: new Date(this.filters.startDate).toISOString(),
      endDate: this.filters.endDate ? new Date(this.filters.endDate).toISOString() : undefined,
      eventType: this.filters.eventType || undefined,
      source: this.filters.source || undefined,
    };
    this.eventsService.getEvents(filters).subscribe({
      next: (events) => {
        this.events.set(events);
        this.loading.set(false);
      },
      error: (err: { message?: string }) => {
        this.error.set(err.message ?? 'Error al cargar eventos');
        this.loading.set(false);
      },
    });
  }

  private loadStats(): void {
    this.eventsService.getStats().subscribe({
      next: (stats) => this.stats.set(stats),
      error: () => {},
    });
  }

  readonly objectEntries = Object.entries;

  private defaultStartDate(): string {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d.toISOString().split('T')[0];
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }
}
