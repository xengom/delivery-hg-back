import { Recipient } from '../../domain/recipient';
import { Delivery } from '../../domain/delivery';
import { Contact } from '../../domain/contact';

export interface RecipientRepository {
  findById(id: string): Promise<Recipient | null>;
  search(query: string): Promise<Recipient[]>;
  save(recipient: Recipient): Promise<void>;
  update(recipient: Recipient): Promise<void>;
  delete(id: string): Promise<void>;
}

export interface DeliveryRepository {
  findById(id: string): Promise<Delivery | null>;
  findAll(): Promise<Delivery[]>;
  save(delivery: Delivery): Promise<void>;
  updateStatus(id: string, status: 'PICKED_UP' | 'DELIVERED' | 'SETTLED'): Promise<void>;
  getDailyStats(startDate: string, endDate: string): Promise<any[]>;
  getMonthlyStats(yearMonth: string): Promise<any[]>;
}

export interface ContactRepository {
  findById(id: string): Promise<Contact | null>;
  findAll(): Promise<Contact[]>;
  findByBusinessName(businessName: string): Promise<Contact | null>;
  save(contact: Contact): Promise<void>;
  update(contact: Contact): Promise<void>;
  delete(id: string): Promise<void>;
}
