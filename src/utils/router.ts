export interface RouteParams {
  roomId?: string;
}

export class Router {
  static getCurrentPath(): string {
    return window.location.pathname;
  }

  static getParams(): RouteParams {
    const path = this.getCurrentPath();
    const segments = path.split('/').filter(Boolean);
    
    if (segments.length >= 2 && segments[0] === 'room') {
      return { roomId: segments[1] };
    }
    
    return {};
  }

  static navigateToRoom(roomId: string): void {
    const newPath = `/room/${roomId}`;
    window.history.pushState({}, '', newPath);
    window.dispatchEvent(new PopStateEvent('popstate'));
  }

  static navigateToHome(): void {
    window.history.pushState({}, '', '/');
    window.dispatchEvent(new PopStateEvent('popstate'));
  }

  static isRoomPath(): boolean {
    const path = this.getCurrentPath();
    return path.startsWith('/room/');
  }
}