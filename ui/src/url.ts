export const getUrl = () => process.env.NODE_ENV === 'production' ? window.location.host : 'localhost:18081';

export const getProtocol = () => window.location.protocol;
