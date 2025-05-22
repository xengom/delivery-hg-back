import { eq, like, and, sql } from 'drizzle-orm';
import { DrizzleD1Database } from 'drizzle-orm/d1';
import { nanoid } from 'nanoid';
import { recipients, deliveries, contacts } from '../../infra/schema';
import { RecipientRepository, DeliveryRepository, ContactRepository } from './repository-interfaces';
import { Recipient, Address } from '../../domain/recipient';
import { Delivery } from '../../domain/delivery';
import { Contact } from '../../domain/contact';

export class DrizzleRecipientRepository implements RecipientRepository {
  constructor(private db: DrizzleD1Database) {}

  async findById(id: string): Promise<Recipient | null> {
    const result = await this.db.select().from(recipients).where(eq(recipients.id, id)).get();
    if (!result) return null;

    return new Recipient(
      result.id,
      result.name,
      result.phone,
      new Address(result.address, result.lat || undefined, result.lng || undefined),
      result.memo || undefined
    );
  }

  async search(query: string): Promise<Recipient[]> {
    const results = await this.db.select()
      .from(recipients)
      .where(
        sql`address LIKE ${'%' + query + '%'} OR phone LIKE ${'%' + query + '%'}`
      )
      .limit(10)
      .all();

    return results.map(r => new Recipient(
      r.id,
      r.name,
      r.phone,
      new Address(r.address, r.lat || undefined, r.lng || undefined),
      r.memo || undefined
    ));
  }

  async save(recipient: Recipient): Promise<void> {
    await this.db.insert(recipients).values({
      id: recipient.id || nanoid(),
      name: recipient.name,
      phone: recipient.phone,
      address: recipient.address.full,
      memo: recipient.memo,
      lat: recipient.address.lat,
      lng: recipient.address.lng
    }).run();
  }

  async update(recipient: Recipient): Promise<void> {
    await this.db.update(recipients)
      .set({
        name: recipient.name,
        phone: recipient.phone,
        address: recipient.address.full,
        memo: recipient.memo,
        lat: recipient.address.lat,
        lng: recipient.address.lng
      })
      .where(eq(recipients.id, recipient.id))
      .run();
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(recipients).where(eq(recipients.id, id)).run();
  }
}

export class DrizzleDeliveryRepository implements DeliveryRepository {
  constructor(private db: DrizzleD1Database) {}

  async findById(id: string): Promise<Delivery | null> {
    const result = await this.db.query.deliveries.findFirst({
      where: eq(deliveries.id, id),
      with: {
        recipient: true
      }
    });

    if (!result) return null;

    const recipient = new Recipient(
      result.recipient.id,
      result.recipient.name,
      result.recipient.phone,
      new Address(
        result.recipient.address,
        result.recipient.lat || undefined,
        result.recipient.lng || undefined
      ),
      result.recipient.memo || undefined
    );

    return new Delivery(
      result.id,
      recipient,
      result.pickupPlace,
      result.boxCount,
      result.settlement as 'PREPAID' | 'COLLECT' | 'OFFICE' | 'RECEIPT_REQUIRED',
      result.fee,
      result.note || undefined,
      result.status as 'PICKED_UP' | 'DELIVERED' | 'SETTLED'
    );
  }

  async findAll(): Promise<Delivery[]> {
    const results = await this.db.query.deliveries.findMany({
      with: {
        recipient: true
      }
    });

    return results.map(r => {
      const recipient = new Recipient(
        r.recipient.id,
        r.recipient.name,
        r.recipient.phone,
        new Address(
          r.recipient.address,
          r.recipient.lat || undefined,
          r.recipient.lng || undefined
        ),
        r.recipient.memo || undefined
      );

      return new Delivery(
        r.id,
        recipient,
        r.pickupPlace,
        r.boxCount,
        r.settlement as 'PREPAID' | 'COLLECT' | 'OFFICE' | 'RECEIPT_REQUIRED',
        r.fee,
        r.note || undefined,
        r.status as 'PICKED_UP' | 'DELIVERED' | 'SETTLED'
      );
    });
  }

  async save(delivery: Delivery): Promise<void> {
    await this.db.insert(deliveries).values({
      id: delivery.id || nanoid(),
      recipientId: delivery.recipient.id,
      pickupPlace: delivery.pickupPlace,
      boxCount: delivery.boxCount,
      settlement: delivery.settlement,
      fee: delivery.fee,
      note: delivery.note,
      status: delivery.status,
      updatedAt: new Date().toISOString()
    }).run();
  }

  async updateStatus(id: string, status: 'PICKED_UP' | 'DELIVERED' | 'SETTLED'): Promise<void> {
    await this.db.update(deliveries)
      .set({
        status,
        updatedAt: new Date().toISOString()
      })
      .where(eq(deliveries.id, id))
      .run();
  }

  async getDailyStats(startDate: string, endDate: string): Promise<any[]> {
    return this.db.execute(sql`
      SELECT date(updated_at) AS day,
             COUNT(*) deliveries,
             SUM(box_count) boxes,
             SUM(fee) fees,
             SUM(status='SETTLED') settled
      FROM deliveries
      WHERE updated_at BETWEEN ${startDate} AND ${endDate}
      GROUP BY day ORDER BY day DESC
    `).all();
  }

  async getMonthlyStats(yearMonth: string): Promise<any[]> {
    return this.db.execute(sql`
      SELECT strftime('%Y-%m', updated_at) AS month,
             COUNT(*) deliveries,
             SUM(box_count) boxes,
             SUM(fee) fees,
             SUM(status='SETTLED') settled
      FROM deliveries
      WHERE updated_at LIKE ${yearMonth + '%'}
      GROUP BY month ORDER BY month DESC
    `).all();
  }
}

export class DrizzleContactRepository implements ContactRepository {
  constructor(private db: DrizzleD1Database) {}

  async findById(id: string): Promise<Contact | null> {
    const result = await this.db.select().from(contacts).where(eq(contacts.id, id)).get();
    if (!result) return null;

    return new Contact(
      result.id,
      result.businessName,
      result.phone,
      result.address,
      result.note || undefined
    );
  }

  async findAll(): Promise<Contact[]> {
    const results = await this.db.select().from(contacts).all();

    return results.map(c => new Contact(
      c.id,
      c.businessName,
      c.phone,
      c.address,
      c.note || undefined
    ));
  }

  async findByBusinessName(businessName: string): Promise<Contact | null> {
    const result = await this.db.select()
      .from(contacts)
      .where(eq(contacts.businessName, businessName))
      .get();

    if (!result) return null;

    return new Contact(
      result.id,
      result.businessName,
      result.phone,
      result.address,
      result.note || undefined
    );
  }

  async save(contact: Contact): Promise<void> {
    await this.db.insert(contacts).values({
      id: contact.id || nanoid(),
      businessName: contact.businessName,
      phone: contact.phone,
      address: contact.address,
      note: contact.note
    }).run();
  }

  async update(contact: Contact): Promise<void> {
    await this.db.update(contacts)
      .set({
        businessName: contact.businessName,
        phone: contact.phone,
        address: contact.address,
        note: contact.note
      })
      .where(eq(contacts.id, contact.id))
      .run();
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(contacts).where(eq(contacts.id, id)).run();
  }
}
