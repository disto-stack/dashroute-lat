import { Controller, Post, Body, UnauthorizedException, Headers, BadRequestException } from '@nestjs/common';
import { DevicesService } from './devices.service.js';

interface RegisterTokenDto {
  expoPushToken: string;
}

@Controller('devices')
export class DevicesController {
  constructor(private readonly devicesService: DevicesService) {}

  @Post('register-token')
  async registerToken(
    @Headers('authorization') authHeader: string,
    @Body() body: RegisterTokenDto,
  ) {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing or invalid authorization header');
    }
    
    if (!body || !body.expoPushToken) {
      throw new BadRequestException('expoPushToken is required');
    }

    const token = authHeader.replace('Bearer ', '');
    let userId: string;

    try {
      const payloadBase64 = token.split('.')[1];
      const payload = JSON.parse(Buffer.from(payloadBase64, 'base64').toString());
      userId = payload.sub || payload.id;
      if (!userId) throw new Error('No sub/id in JWT');
    } catch (e) {
      throw new UnauthorizedException('Invalid JWT');
    }

    await this.devicesService.registerToken(userId, body.expoPushToken);
    return { success: true };
  }
}
