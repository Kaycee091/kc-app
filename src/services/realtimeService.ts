import { supabase, isSupabaseConfigured } from './supabaseClient';

type RealtimeCallback = (payload: any) => void;

class KCRealtimeEngine {
  private channelName = 'kc_global_social_channel';
  private broadcastChannel: BroadcastChannel | null = null;
  private supabaseChannel: any = null;
  private listeners: Map<string, Set<RealtimeCallback>> = new Map();

  constructor() {
    // 1. HTML5 BroadcastChannel for local multi-window real-time synchronization
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        this.broadcastChannel = new BroadcastChannel(this.channelName);
        this.broadcastChannel.onmessage = (event) => {
          const { type, payload } = event.data;
          this.emit(type, payload);
        };
      } catch (err) {
        console.warn('BroadcastChannel initialization warning:', err);
      }
    }

    // 2. Supabase Realtime Postgres Channels when cloud keys exist
    if (isSupabaseConfigured) {
      try {
        this.supabaseChannel = supabase
          .channel('public:social_events')
          .on('postgres_changes', { event: '*', schema: 'public', table: 'posts' }, (payload) => {
            this.emit('post_event', payload);
          })
          .on('postgres_changes', { event: '*', schema: 'public', table: 'reactions' }, (payload) => {
            this.emit('reaction_event', payload);
          })
          .on('postgres_changes', { event: '*', schema: 'public', table: 'comments' }, (payload) => {
            this.emit('comment_event', payload);
          })
          .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, (payload) => {
            this.emit('message_event', payload);
          })
          .on('broadcast', { event: 'typing' }, (payload) => {
            this.emit('typing', payload.payload);
          })
          .subscribe();
      } catch (err) {
        console.warn('Supabase realtime setup error:', err);
      }
    }
  }

  public subscribe(event: string, callback: RealtimeCallback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);

    return () => {
      const set = this.listeners.get(event);
      if (set) {
        set.delete(callback);
      }
    };
  }

  public broadcast(type: string, payload: any) {
    if (this.broadcastChannel) {
      try {
        this.broadcastChannel.postMessage({ type, payload });
      } catch (e) {
        console.error('Failed to broadcast message:', e);
      }
    }
    this.emit(type, payload);

    if (isSupabaseConfigured && this.supabaseChannel && type === 'typing') {
      this.supabaseChannel.send({
        type: 'broadcast',
        event: 'typing',
        payload,
      });
    }
  }

  private emit(event: string, payload: any) {
    const set = this.listeners.get(event);
    if (set) {
      set.forEach((cb) => {
        try {
          cb(payload);
        } catch (e) {
          console.error(`Error in realtime callback for ${event}:`, e);
        }
      });
    }
  }
}

export const realtimeEngine = new KCRealtimeEngine();
