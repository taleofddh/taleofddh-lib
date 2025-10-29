/**
 * Aggregate utilities package
 * Exports all individual utility packages for convenient importing
 */

// Re-export all utility packages
export * as response from '@taleofddh/response';
export * as date from '@taleofddh/date';
export * as array from '@taleofddh/array';
export * as error from '@taleofddh/error';
export * as logger from '@taleofddh/logger';
export * as middleware from '@taleofddh/middleware';
export * as constants from '@taleofddh/constants';
export * as validation from '@taleofddh/validation';


// Export default imports for convenience
export { default as Logger } from '@taleofddh/logger';
export { default as ResponseHelper } from '@taleofddh/response';
export { default as ErrorHandler } from '@taleofddh/error';
export { default as ValidationHelper } from '@taleofddh/validation';

export { default as MiddlewareHelper } from '@taleofddh/middleware';
export { default as DateHelper } from '@taleofddh/date';
export { default as ArrayHelper } from '@taleofddh/array';

// Export commonly used functions directly for convenience
export {
  createResponse,
  createErrorResponse,
  createValidationErrorResponse,
  createNotFoundResponse,
  createConflictResponse,
  createUnauthorizedResponse,
  createForbiddenResponse,
  createCreatedResponse,
  createNoContentResponse,
  createPaginatedResponse,
  DEFAULT_CORS_HEADERS
} from '@taleofddh/response';

export {
  dateTimeFullFormatToString,
  dateFormatToString,
  getCurrentDateTimeString,
  getCurrentDateString,
  parseDateToFullFormat,
  parseDateToDateFormat,
  addDays,
  addHours,
  isToday,
  daysDifference,
  formatForDisplay,
  formatDateTimeForDisplay
} from '@taleofddh/date';

export {
  distinctValues,
  groupBy,
  distinctObjects,
  sortBy,
  filterBy,
  chunk,
  flatten,
  unique,
  intersection,
  difference,
  shuffle,
  random,
  isEmpty,
  sum,
  average,
  min,
  max
} from '@taleofddh/array';

export {
  classifyError,
  logError,
  createErrorClass,
  NotFoundError,
  ConflictError,
  UnauthorizedError,
  ForbiddenError,
  BusinessLogicError,
  ValidationError,
  asyncHandler,
  isErrorType,
  isDynamoDBError,
  sanitizeHeaders
} from '@taleofddh/error';

export {
  corsMiddleware,
  addCorsHeaders,
  jsonBodyParser,
  validationMiddleware,
  pathParameterValidation,
  queryParameterValidation,
  requestLoggingMiddleware,
  errorHandlingMiddleware,
  rateLimitingMiddleware,
  composeMiddleware,
  withMiddleware,
  authenticationMiddleware
} from '@taleofddh/middleware';

export {
  ENVIRONMENT,
  HTTP_STATUS,
  ERROR_CODES,
  AWS_CONFIG,
  TABLE_PATTERNS,
  S3_PATTERNS,
  SNS_PATTERNS,
  PAGINATION,
  PATTERNS,
  REQUEST_STATUS,
  REQUEST_TYPES,
  REQUEST_ACTIONS,
  LOG_LEVELS,
  CORS_CONFIG,
  RATE_LIMIT,
  TIMEOUTS,
  FILE_LIMITS,
  DATE_FORMATS,
  MEDIA_TYPES,
  CACHE_CONFIG,
  VALIDATION_LIMITS
} from '@taleofddh/constants';

export {
  validateEmail,
  validateRequired,
  validateStringLength,
  validateUUID,
  validateNumber,
  validateInteger,
  validateDate,
  validateEnum,
  validateArray,
  sanitizeInput,
  sanitizeHtml,
  validatePhone,
  validateUsername,
  validateObject,
  validatePagination,
  PATTERNS as VALIDATION_PATTERNS
} from '@taleofddh/validation';