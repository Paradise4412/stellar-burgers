export const getWsUrl = (token?: string) => {
  const base = (process.env.BURGER_API_URL || '')
    .replace('https', 'wss')
    .replace('/api', '');
  return token ? `${base}/orders?token=${token}` : `${base}/orders`;
};
