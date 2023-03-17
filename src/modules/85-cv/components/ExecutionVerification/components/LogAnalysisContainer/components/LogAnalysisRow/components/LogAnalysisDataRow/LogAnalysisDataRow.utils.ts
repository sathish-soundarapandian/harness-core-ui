export const getDisplayMessage = (message: string, isErrorTracking?: boolean): string =>
  isErrorTracking ? message.split('|').slice(0, 4).join('|') : message
