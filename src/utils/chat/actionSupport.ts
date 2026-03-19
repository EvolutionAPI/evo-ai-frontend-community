import axios from 'axios';

const UNSUPPORTED_ACTION_HTTP_STATUS = new Set([404, 405, 501]);

export const isActionNotSupported = (error: unknown): boolean => {
  if (!axios.isAxiosError(error)) {
    return false;
  }

  const status = error.response?.status;
  return typeof status === 'number' && UNSUPPORTED_ACTION_HTTP_STATUS.has(status);
};
