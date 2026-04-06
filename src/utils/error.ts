export const formatErrorResponse = (message: string, details?: any) => ({
  error: message,
  ...(details && { details }),
});

export const formatSuccessResponse = <T>(data: T) => ({
  data,
});
