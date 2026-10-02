import { Injectable, Inject } from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import * as databaseProvider from '../database/database.provider.js';
import { deviceTokens } from '../database/schema.js';
import { eq } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class DevicesService {
  constructor(
    @Inject(databaseProvider.DRIZZLE_DB) private readonly db: databaseProvider.DrizzleDb,
    @InjectPinoLogger(DevicesService.name)
    private readonly logger: PinoLogger,
  ) {}

  async registerToken(userId: string, expoPushToken: string): Promise<void> {
    const existing = await this.db
      .select()
      .from(deviceTokens)
      .where(eq(deviceTokens.userId, userId))
      .limit(1);

    if (existing.length > 0) {
      await this.db
        .update(deviceTokens)
        .set({
          expoPushToken,
          updatedAt: new Date(),
        })
        .where(eq(deviceTokens.userId, userId));
      this.logger.info({ userId }, 'Token updated');
    } else {
      await this.db.insert(deviceTokens).values({
        id: `tok_${uuidv4().replace(/-/g, '')}`,
        userId,
        expoPushToken,
      });
      this.logger.info({ userId }, 'Token registered');
    }
  }

  async removeToken(expoPushToken: string): Promise<void> {
    await this.db.delete(deviceTokens).where(eq(deviceTokens.expoPushToken, expoPushToken));
    this.logger.info('Token removed');
  }

  async findTokenByUserId(userId: string): Promise<string | null> {
    const records = await this.db
      .select()
      .from(deviceTokens)
      .where(eq(deviceTokens.userId, userId))
      .limit(1);

    return records.length > 0 ? records[0].expoPushToken : null;
  }

  async findTokenByDriverId(driverId: string): Promise<string | null> {
    const userId = driverId.replace(/^cur_/, 'usr_');
    return this.findTokenByUserId(userId);
  }
}
