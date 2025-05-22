import { Hono } from 'hono';
import { drizzle } from 'drizzle-orm/d1';
import { nanoid } from 'nanoid';
import * as schema from './schema';
import { DrizzleRecipientRepository, DrizzleDeliveryRepository } from '../app/repos/drizzle-repos';
import { RecipientService } from '../app/services/recipientService';
import { DeliveryService, DeliveryFactory } from '../app/services/deliveryService';
import { Address } from '../domain/recipient';

type Env = {
  DB: D1Database;
};

const app = new Hono<{ Bindings: Env }>();

// Middleware to set up repositories and services
app.use('*', async (c, next) => {
  const db = drizzle(c.env.DB, { schema });
  
  // Set up repositories
  const recipientRepo = new DrizzleRecipientRepository(db);
  const deliveryRepo = new DrizzleDeliveryRepository(db);
  
  // Set up services
  const recipientService = new RecipientService(recipientRepo);
  const deliveryService = new DeliveryService(deliveryRepo);
  
  // Attach services to context
  c.set('recipientService', recipientService);
  c.set('deliveryService', deliveryService);
  
  await next();
});

// Recipient endpoints
app.get('/api/recipients', async (c) => {
  const q = c.req.query('q') ?? '';
  const recipientService = c.get('recipientService');
  const recipients = await recipientService.search(q);
  return c.json(recipients);
});

app.post('/api/recipients', async (c) => {
  const body = await c.req.json();
  const recipientService = c.get('recipientService');
  
  const recipient = await recipientService.createRecipient(
    body.name,
    body.phone,
    body.address,
    body.memo,
    body.lat,
    body.lng
  );
  
  return c.json(recipient);
});

app.put('/api/recipients/:id', async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json();
  const recipientService = c.get('recipientService');
  
  try {
    const recipient = await recipientService.updateRecipient(
      id,
      body.name,
      body.phone,
      body.address,
      body.memo,
      body.lat,
      body.lng
    );
    
    return c.json(recipient);
  } catch (error) {
    return c.json({ error: error.message }, 404);
  }
});

app.delete('/api/recipients/:id', async (c) => {
  const id = c.req.param('id');
  const recipientService = c.get('recipientService');
  
  try {
    await recipientService.deleteRecipient(id);
    return c.json({ ok: true });
  } catch (error) {
    return c.json({ error: error.message }, 404);
  }
});

// Delivery endpoints
app.get('/api/deliveries', async (c) => {
  const deliveryService = c.get('deliveryService');
  const deliveries = await deliveryService.findAll();
  return c.json(deliveries);
});

app.post('/api/deliveries', async (c) => {
  const body = await c.req.json();
  const recipientService = c.get('recipientService');
  const deliveryService = c.get('deliveryService');
  
  // Get or create recipient
  let recipient;
  if (body.recipientId) {
    recipient = await recipientService.findById(body.recipientId);
    if (!recipient) {
      return c.json({ error: `Recipient with id ${body.recipientId} not found` }, 404);
    }
  } else if (body.recipient) {
    // Create a new recipient if not exists
    recipient = await recipientService.createRecipient(
      body.recipient.name,
      body.recipient.phone,
      body.recipient.address,
      body.recipient.memo,
      body.recipient.lat,
      body.recipient.lng
    );
  } else {
    return c.json({ error: 'Either recipientId or recipient object is required' }, 400);
  }
  
  // Create delivery
  const delivery = await deliveryService.register(
    recipient,
    body.pickupPlace,
    body.boxCount,
    body.settlement,
    body.fee,
    body.note
  );
  
  return c.json(delivery);
});

app.post('/api/deliveries/:id/status', async (c) => {
  const id = c.req.param('id');
  const { status } = await c.req.json();
  const deliveryService = c.get('deliveryService');
  
  try {
    await deliveryService.changeStatus(id, status);
    return c.json({ ok: true });
  } catch (error) {
    return c.json({ error: error.message }, 400);
  }
});

// Statistics endpoints
app.get('/api/stats/daily', async (c) => {
  const startDate = c.req.query('start') ?? '';
  const endDate = c.req.query('end') ?? '';
  const deliveryService = c.get('deliveryService');
  
  if (!startDate || !endDate) {
    return c.json({ error: 'Both start and end dates are required' }, 400);
  }
  
  const stats = await deliveryService.getDailyStats(startDate, endDate);
  return c.json(stats);
});

app.get('/api/stats/monthly', async (c) => {
  const yearMonth = c.req.query('month') ?? '';
  const deliveryService = c.get('deliveryService');
  
  if (!yearMonth) {
    return c.json({ error: 'Month parameter is required (format: YYYY-MM)' }, 400);
  }
  
  const stats = await deliveryService.getMonthlyStats(yearMonth);
  return c.json(stats);
});

export default app;