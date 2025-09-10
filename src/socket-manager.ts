import { withResolvers } from 'radashi';
import type { Socket } from 'socket.io-client';
import { io } from 'socket.io-client';

export interface IConnectionInfo {
  socket: Socket;
  endpoint: string;
  refCount: number;
  lastUsed: number;
}

export interface ITaskSubscription<T = any> {
  resourceType: string;
  resourceId: string;
  defer: ReturnType<typeof withResolvers<T>>;
  cleanup: () => void;
}

export interface IResourceSubscribeEvent<T> {
  resourceType: string;
  resourceId: string;
  payload?: T;
}

export interface ISocketAuthPayload {
  type: string;
  url: string;
  key: string;
}

/**
 * Socket connection manager for reusing socket.io connections
 */
export class SocketManager {
  private connections = new Map<string, IConnectionInfo>();
  private activeSubscriptions = new Map<string, ITaskSubscription>();

  private getSubscriptionKey(resourceType: string, resourceId: string): string {
    return `${resourceType}:${resourceId}`;
  }

  /**
   * Get or create a socket connection for the given endpoint
   */
  async getOrCreateConnection(endpoint: string, authPayload: ISocketAuthPayload): Promise<Socket> {
    const existing = this.connections.get(endpoint);

    if (existing && existing.socket.connected) {
      existing.refCount++;
      existing.lastUsed = Date.now();
      return existing.socket;
    }

    // Create new connection
    const socket = io(endpoint, {
      path: '/socket.io',
      transports: ['websocket'],
      auth: (cb) => {
        cb(authPayload);
      },
    });

    // Setup global event handler for resource subscriptions
    socket.on('resource:subscribe', (event: IResourceSubscribeEvent<any>) => {
      const subscriptionKey = this.getSubscriptionKey(event.resourceType, event.resourceId);
      const subscription = this.activeSubscriptions.get(subscriptionKey);
      if (!subscription || !event.payload) {
        return;
      }

      if (event.payload.success) {
        subscription.defer.resolve(event.payload);
      } else {
        subscription.defer.reject(new Error('Socket operation failed'));
      }
    });

    // Wait for connection to be established
    await new Promise<void>((resolve, reject) => {
      socket.on('connect', () => resolve());
      socket.on('connect_error', (error) => reject(error));
    });

    const connectionInfo: IConnectionInfo = {
      socket,
      endpoint,
      refCount: 1,
      lastUsed: Date.now(),
    };

    this.connections.set(endpoint, connectionInfo);
    return socket;
  }

  /**
   * Release a connection reference
   */
  releaseConnection(endpoint: string): void {
    const connection = this.connections.get(endpoint);
    if (!connection) return;

    connection.refCount--;
    connection.lastUsed = Date.now();

    // Keep connection alive for potential reuse
    // Only disconnect if no active references and connection is idle
    if (connection.refCount <= 0) {
      // Set a timeout to disconnect idle connections
      setTimeout(() => {
        const current = this.connections.get(endpoint);
        if (current && current.refCount <= 0 && Date.now() - current.lastUsed > 30000) {
          current.socket.disconnect();
          this.connections.delete(endpoint);
        }
      }, 30000); // 30 seconds idle timeout
    }
  }

  /**
   * Subscribe to a resource with automatic cleanup
   */
  subscribeToResource<T>(socket: Socket, resourceType: string, resourceId: string): Promise<T> {
    const defer = withResolvers<T>();
    const subscriptionKey = this.getSubscriptionKey(resourceType, resourceId);

    // Register subscription for this task
    const cleanup = () => {
      this.activeSubscriptions.delete(subscriptionKey);
    };

    this.activeSubscriptions.set(subscriptionKey, {
      resourceType,
      resourceId,
      defer,
      cleanup,
    });

    // Subscribe to resource updates
    socket.emit('resource:subscribe', {
      resourceType,
      resourceId,
    });

    return defer.promise;
  }

  /**
   * Unsubscribe from a resource
   */
  unsubscribeFromResource(socket: Socket, resourceType: string, resourceId: string): void {
    const subscriptionKey = this.getSubscriptionKey(resourceType, resourceId);

    // Unsubscribe from resource updates
    socket.emit('resource:unsubscribe', {
      resourceType,
      resourceId,
    });

    // Clean up subscription
    const subscription = this.activeSubscriptions.get(subscriptionKey);
    if (subscription) {
      subscription.cleanup();
    }
  }

  /**
   * Manually cleanup all connections and active subscriptions
   * Useful for cleanup when the instance is no longer needed
   */
  cleanup(): void {
    // Clean up all active subscriptions
    for (const [_taskId, subscription] of this.activeSubscriptions) {
      subscription.cleanup();
    }
    this.activeSubscriptions.clear();

    // Disconnect all connections
    for (const [_endpoint, connection] of this.connections) {
      connection.socket.disconnect();
    }
    this.connections.clear();
  }
}
