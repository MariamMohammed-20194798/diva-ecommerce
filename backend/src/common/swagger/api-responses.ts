import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

/** Standard 400 validation / business rule response (ValidationPipe). */
export const ApiValidationErrorResponse = () =>
  ApiBadRequestResponse({
    description:
      'Validation failed — invalid or missing fields (class-validator / ValidationPipe)',
    schema: {
      example: {
        statusCode: 400,
        message: ['email must be an email'],
        error: 'Bad Request',
      },
    },
  });

export const ApiUnauthorizedErrorResponse = () =>
  ApiUnauthorizedResponse({
    description: 'Missing or invalid JWT access token',
    schema: {
      example: {
        statusCode: 401,
        message: 'Unauthorized',
      },
    },
  });

export const ApiForbiddenErrorResponse = () =>
  ApiForbiddenResponse({
    description:
      'Authenticated but insufficient permissions (e.g. requires ADMIN role)',
    schema: {
      example: {
        statusCode: 403,
        message: 'Forbidden resource',
        error: 'Forbidden',
      },
    },
  });

export const ApiNotFoundErrorResponse = () =>
  ApiNotFoundResponse({
    description: 'Resource not found',
    schema: {
      example: {
        statusCode: 404,
        message: 'Not Found',
        error: 'Not Found',
      },
    },
  });

/** Combines common error responses for protected endpoints. */
export const ApiProtectedEndpointErrors = () =>
  applyDecorators(ApiUnauthorizedErrorResponse(), ApiValidationErrorResponse());

/** Combines common error responses for admin endpoints. */
export const ApiAdminEndpointErrors = () =>
  applyDecorators(
    ApiProtectedEndpointErrors(),
    ApiForbiddenErrorResponse(),
    ApiNotFoundErrorResponse(),
  );
