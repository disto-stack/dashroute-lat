import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import {
  DomainException,
  UserAlreadyExistsException,
  InvalidCredentialsException,
  UserNotFoundException,
  InvalidTokenException,
  CourierNotFoundException,
} from '../../../domain/exceptions/domain.exceptions.js';

@Catch(DomainException)
export class DomainExceptionFilter implements ExceptionFilter {
  catch(exception: DomainException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.BAD_REQUEST;

    if (exception instanceof UserAlreadyExistsException) {
      status = HttpStatus.CONFLICT;
    } else if (
      exception instanceof InvalidCredentialsException ||
      exception instanceof InvalidTokenException
    ) {
      status = HttpStatus.UNAUTHORIZED;
    } else if (
      exception instanceof UserNotFoundException ||
      exception instanceof CourierNotFoundException
    ) {
      status = HttpStatus.NOT_FOUND;
    }

    response.status(status).json({
      statusCode: status,
      error: exception.name,
      message: exception.message,
    });
  }
}
