import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const recipients = sqliteTable('recipients', {
  id: text('id').primaryKey(),
  name: text('name'),
  phone: text('phone').notNull(),
  address: text('address').notNull(),
  memo: text('memo'),
  lat: integer('lat'),
  lng: integer('lng'),
});

export const deliveries = sqliteTable('deliveries', {
  id: text('id').primaryKey(),
  recipientId: text('recipient_id').references(() => recipients.id),
  pickupPlace: text('pickup_place').notNull(),
  boxCount: integer('box_count').notNull(),
  settlement: text('settlement').notNull(),
  fee: integer('fee'),
  note: text('note'),
  status: text('status').notNull().default('PICKED_UP'),
  updatedAt: text('updated_at').default('CURRENT_TIMESTAMP')
});