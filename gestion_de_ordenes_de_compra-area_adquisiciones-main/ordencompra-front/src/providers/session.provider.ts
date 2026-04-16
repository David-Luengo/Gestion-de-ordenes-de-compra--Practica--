export class SessionProvider {
  static isAuthenticated() {
    return !!sessionStorage.getItem('session_token');
  }
}