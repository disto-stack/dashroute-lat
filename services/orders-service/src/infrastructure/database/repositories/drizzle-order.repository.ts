import { Inject, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { type IOrderRepository, type OrderSearchCriteria, type CursorPaginationParams, type PaginatedResult, type CreateOrderParams } from '../../../domain/ports/order-repository.port.js';
import { Order } from '../../../domain/entities/order.entity.js';
import { DRIZZLE_DB, type DrizzleDb } from '../database.provider.js';
import { orders } from '../schema.js';
import { eq, and, or, lt, desc } from 'drizzle-orm';

@Injectable()
export class DrizzleOrderRepository implements IOrderRepository {
  constructor(@Inject(DRIZZLE_DB) private readonly db: DrizzleDb) {}

  async create(orderData: CreateOrderParams): Promise<Order> {
    try {
      const orderId = 'ord_' + randomUUID().replace(/-/g, '').slice(0, 25);
      const [inserted] = await this.db.insert(orders).values({
        id: orderId,
        customerId: orderData.customerId,
        status: orderData.status,
        pickupLocation: orderData.pickupLocation,
        dropoffLocation: orderData.dropoffLocation,
      }).returning();

      return this.mapToEntity(inserted);
    } catch (error) {
      console.error('Error creating order in DB:', error);
      throw new InternalServerErrorException('Could not create order');
    }
  }

  async findById(id: string): Promise<Order | null> {
    const [row] = await this.db.select().from(orders).where(eq(orders.id, id));
    if (!row) return null;
    return this.mapToEntity(row);
  }

  async findByCustomerId(customerId: string): Promise<Order[]> {
    const rows = await this.db.select().from(orders).where(eq(orders.customerId, customerId));
    return rows.map(row => this.mapToEntity(row));
  }

  async updateStatus(id: string, status: Order['status'], courierId?: string): Promise<Order> {
    const updateData: any = { status, updatedAt: new Date() };
    if (courierId !== undefined) {
      updateData.courierId = courierId;
    }

    const [updated] = await this.db.update(orders)
      .set(updateData)
      .where(eq(orders.id, id))
      .returning();

    if (!updated) {
      throw new NotFoundException(`Order ${id} not found`);
    }

    return this.mapToEntity(updated);
  }

  private mapToEntity(row: typeof orders.$inferSelect): Order {
    return new Order(
      row.id,
      row.customerId,
      row.status as Order['status'],
      row.pickupLocation,
      row.dropoffLocation,
      row.createdAt,
      row.updatedAt,
      row.courierId
    );
  }

  async search(criteria: OrderSearchCriteria, pagination: CursorPaginationParams): Promise<PaginatedResult<Order>> {
    const conditions = [];

    if (criteria.customerId) conditions.push(eq(orders.customerId, criteria.customerId));
    if (criteria.courierId) conditions.push(eq(orders.courierId, criteria.courierId));
    if (criteria.status) conditions.push(eq(orders.status, criteria.status));

    if (pagination.cursor) {
      const { createdAt, id } = this.decodeCursor(pagination.cursor);
      // keyset pagination: createdAt < cursorDate OR (createdAt == cursorDate AND id < cursorId)
      conditions.push(
        or(
          lt(orders.createdAt, createdAt),
          and(eq(orders.createdAt, createdAt), lt(orders.id, id))
        )
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
    const limit = pagination.limit > 0 && pagination.limit <= 50 ? pagination.limit : 10;

    // Fetch limit + 1 to know if there's a next page
    const rows = await this.db
      .select()
      .from(orders)
      .where(whereClause)
      .orderBy(desc(orders.createdAt), desc(orders.id))
      .limit(limit + 1);

    const hasNextPage = rows.length > limit;
    const paginatedRows = hasNextPage ? rows.slice(0, limit) : rows;

    const data = paginatedRows.map(row => this.mapToEntity(row));
    
    let nextCursor = null;
    if (hasNextPage && data.length > 0) {
      const lastItem = data[data.length - 1];
      nextCursor = this.encodeCursor(lastItem.createdAt, lastItem.id);
    }

    return {
      data,
      nextCursor,
      hasNextPage,
    };
  }

  private encodeCursor(createdAt: Date, id: string): string {
    const payload = `${createdAt.getTime()}_${id}`;
    return Buffer.from(payload).toString('base64');
  }

  private decodeCursor(cursor: string): { createdAt: Date; id: string } {
    const payload = Buffer.from(cursor, 'base64').toString('utf-8');
    const [timestampStr, id] = payload.split('_');
    const timestamp = parseInt(timestampStr, 10);
    if (isNaN(timestamp) || !id) {
      throw new Error('Invalid cursor format');
    }
    return { createdAt: new Date(timestamp), id };
  }
}
