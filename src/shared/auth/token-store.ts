const ACCESS_KEY = 'wymnet.accessToken';
const REFRESH_KEY = 'wymnet.refreshToken';

export type TokenPair = {
  accessToken: string;
  refreshToken: string;
};

/**
 * Token storage. The backend issues tokens in JSON responses and has no
 * httpOnly-cookie contract, so we persist to localStorage to support session
 * restoration — accepting the documented XSS trade-off and isolating storage
 * behind this module so a future cookie migration touches only this file.
 */
export const tokenStore = {
  get(): TokenPair | null {
    const accessToken = localStorage.getItem(ACCESS_KEY);
    const refreshToken = localStorage.getItem(REFRESH_KEY);
    if (!accessToken || !refreshToken) return null;
    return { accessToken, refreshToken };
  },
  set(tokens: TokenPair) {
    localStorage.setItem(ACCESS_KEY, tokens.accessToken);
    localStorage.setItem(REFRESH_KEY, tokens.refreshToken);
  },
  clear() {
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
  },
};
