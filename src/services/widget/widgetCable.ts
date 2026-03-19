/* eslint-disable @typescript-eslint/no-explicit-any */
import { createConsumer, Consumer, Subscription } from '@rails/actioncable';

export interface CableOptions {
  cableUrl?: string; // optional custom cable URL, defaults to VITE_API_URL origin + /cable
}

export interface CableHandlers {
  onMessage?: (payload: any) => void;
  onPresence?: (payload: any) => void;
  onDisconnect?: () => void;
}

export class WidgetCable {
  private consumer: Consumer;
  private subscription?: Subscription;
  private handlers: CableHandlers;

  constructor(pubsubToken: string, handlers: CableHandlers = {}, opts: CableOptions = {}) {
    const base = new URL(import.meta.env.VITE_API_URL);
    const cableUrl = opts.cableUrl || `${base.origin}/cable`;
    this.consumer = createConsumer(cableUrl);
    this.handlers = handlers;

    this.subscription = this.consumer.subscriptions.create(
      { channel: 'RoomChannel', pubsub_token: pubsubToken },
      {
        received: (msg: any) => {
          if (!msg) return;
          if (msg.event === 'presence.update') {
            this.handlers.onPresence?.(msg.data);
          } else {
            this.handlers.onMessage?.(msg);
          }
        },
        disconnected: () => {
          this.handlers.onDisconnect?.();
        },
      },
    );
  }

  send(data: any) {
    if (this.subscription) {
      this.subscription.send(data);
    }
  }

  disconnect() {
    try {
      this.consumer.disconnect();
    } catch { /* empty */ }
  }
}
