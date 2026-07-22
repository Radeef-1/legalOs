import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'حدث خطأ داخلي في النظام';
    let code = 'INTERNAL_SERVER_ERROR';
    let details: any = null;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const resContent = exception.getResponse() as any;
      
      if (typeof resContent === 'object' && resContent !== null) {
        message = Array.isArray(resContent.message) 
          ? resContent.message.join(', ') 
          : resContent.message || exception.message;
        code = resContent.code || 'HTTP_EXCEPTION';
        details = resContent.details || null;
      } else {
        message = exception.message;
      }
    } else if (exception.code && exception.message) {
      message = exception.message;
      code = exception.code;
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    response.status(status).json({
      success: false,
      error: {
        code,
        message,
        details,
      },
    });
  }
}
