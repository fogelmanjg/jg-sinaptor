import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EventSummary, EventDetail, EventStats, EventFilters } from '../models/event.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class EventsService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.backendUrl}/api`;

  getEvents(filters: EventFilters): Observable<EventSummary[]> {
    let params = new HttpParams().set('startDate', filters.startDate);
    if (filters.endDate) params = params.set('endDate', filters.endDate);
    if (filters.eventType) params = params.set('eventType', filters.eventType);
    if (filters.source) params = params.set('source', filters.source);
    return this.http.get<EventSummary[]>(`${this.base}/events`, { params });
  }

  getEvent(id: string): Observable<EventDetail> {
    return this.http.get<EventDetail>(`${this.base}/events/${id}`);
  }

  getStats(): Observable<EventStats> {
    return this.http.get<EventStats>(`${this.base}/events/stats`);
  }
}
