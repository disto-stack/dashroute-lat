import { Injectable, Inject, Logger } from '@nestjs/common';
import * as databaseProvider from '../database/database.provider.js';
import { deviceTokens } from '../database/schema.js';
import { eq } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class DevicesService {
  private readonly logger = new Logger(DevicesService.name);

  constructor(@Inject(databaseProvider.DRIZZLE_DB) private readonly db: databaseProvider.DrizzleDb) {}

  async registerToken(driverId: string, expoPushToken: string): Promise<void> {
    const existing = await this.db
      .select()
      .from(deviceTokens)
      .where(eq(deviceTokens.driverId, driverId))
      .limit(1);

    if (existing.length > 0) {
      await this.db
        .update(deviceTokens)
        .set({
          expoPushToken,
          updatedAt: new Date(),
        })
        .where(eq(deviceTokens.driverId, driverId));
      this.logger.log(`Token updated for driver ${driverId}`);
    } else {
      await this.db.insert(deviceTokens).values({
        id: `tok_${uuidv4().replace(/-/g, '')}`,
        driverId,
        expoPushToken,
      });
      this.logger.log(`Token registered for driver ${driverId}`);
    }
  }

  async removeToken(expoPushToken: string): Promise<void> {
    await this.db.delete(deviceTokens).where(eq(deviceTokens.expoPushToken, expoPushToken));
    this.logger.log(`Token removed: ${expoPushToken}`);
  }

  async findTokenByDriverId(driverId: string): Promise<string | null> {
    const records = await this.db
      .select()
      .from(deviceTokens)
      .where(eq(deviceTokens.driverId, driverId))
      .limit(1);
    
    return records.length > 0 ? records[0].expoPushToken : null;
  }
}
