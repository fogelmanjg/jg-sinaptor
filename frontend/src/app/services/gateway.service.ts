import { Injectable, OnDestroy, signal } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { environment } from '../../environments/environment';
import { EventSummary } from '../models/event.model';

@Injectable({ providedIn: 'root' })
export class GatewayService implements OnDestroy {
  private socket: Socket | null = null;
  private readonly newEvent$ = new Subject<EventSummary>();
  readonly connected = signal(false);

  connect(): void {
    if (this.socket) return;
    this.socket = io(`${environment.gatewayUrl}/ws`, {
      transports: ['websocket', 'polling'],
    });

    this.socket.on('connect', () => {
      this.connected.set(true);
      this.socket!.emit('subscribe', 'events');
    });

    this.socket.on('disconnect', () => {
      this.connected.set(false);
    });

    this.socket.on('events:new', (data: EventSummary) => {
      this.newEvent$.next(data);
    });
  }

  get onNewEvent(): Observable<EventSummary> {
    return this.newEvent$.asObservable();
  }

  ngOnDestroy(): void {
    this.socket?.disconnect();
    this.newEvent$.complete();
  }
}
