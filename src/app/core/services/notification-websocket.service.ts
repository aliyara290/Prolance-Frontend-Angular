import { inject, Injectable } from '@angular/core';
import { RxStomp } from '@stomp/rx-stomp';
import { AuthService } from '../auth/services/auth.service';
import { ConfigService } from '../config/config.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface WebSocketMessage {
  type: 'NEW_NOTIFICATION' | 'UNREAD_COUNT_UPDATE' | 'NOTIFICATION_READ';
  notification?: any;
  notificationId?: string;
  unreadCount: number;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationWebSocketService {
  private authService = inject(AuthService);
  private configService = inject(ConfigService);
  private rxStomp: RxStomp;

  constructor() {
    this.rxStomp = new RxStomp();
  }

  public initConnection(): void {
    const token = this.authService.getToken();
    if (!token) return;

    let gatewayUrl = this.configService.value.apiGatewayUrl;
    if (gatewayUrl.endsWith('/api/v1')) {
      gatewayUrl = gatewayUrl.replace('/api/v1', '');
    }
    
    const wsUrl = gatewayUrl.replace(/^http/, 'ws') + '/notification/ws/notifications';
    
    this.rxStomp.configure({
      brokerURL: wsUrl,
      connectHeaders: {
        Authorization: `Bearer ${token}`
      },
      heartbeatIncoming: 0,
      heartbeatOutgoing: 20000,
      reconnectDelay: 5000,
      debug: (msg: string): void => {
        // console.log(new Date(), msg);
      }
    });

    this.rxStomp.activate();
  }

  public watchNotifications(): Observable<WebSocketMessage> {
    return this.rxStomp.watch('/user/queue/notifications').pipe(
      map(message => JSON.parse(message.body) as WebSocketMessage)
    );
  }

  public disconnect(): void {
    this.rxStomp.deactivate();
  }
}
