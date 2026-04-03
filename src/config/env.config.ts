export default () => ({
  auth: {
    accessTokenSecret:
      process.env.JWT_ACCESS_SECRET ?? 'multiface-access-secret-dev',
    refreshTokenSecret:
      process.env.JWT_REFRESH_SECRET ?? 'multiface-refresh-secret-dev',
    accessTokenExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN ?? '15m',
    refreshTokenExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? '7d',
  },
});
