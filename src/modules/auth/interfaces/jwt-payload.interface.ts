export interface JwtPayload {
  sub: string; // user id
  email: string;
  organizationId: string;
  type: 'access' | 'refresh';
  iat?: number;
  exp?: number;
}

export interface JwtTokens {
  accessToken: string;
  refreshToken: string;
}
