import { nanoid } from 'nanoid';
import { Contact } from '../../domain/contact';
import { ContactRepository } from '../repos/repository-interfaces';

export class ContactService {
  constructor(private contactRepository: ContactRepository) {}

  async findById(id: string): Promise<Contact | null> {
    return this.contactRepository.findById(id);
  }

  async findAll(): Promise<Contact[]> {
    return this.contactRepository.findAll();
  }

  async findByBusinessName(businessName: string): Promise<Contact | null> {
    return this.contactRepository.findByBusinessName(businessName);
  }

  async createContact(
    businessName: string,
    phone: string,
    address: string,
    note?: string
  ): Promise<Contact> {
    const contact = new Contact(
      nanoid(),
      businessName,
      phone,
      address,
      note
    );
    
    await this.contactRepository.save(contact);
    return contact;
  }

  async updateContact(
    id: string,
    businessName: string,
    phone: string,
    address: string,
    note?: string
  ): Promise<Contact> {
    const existingContact = await this.contactRepository.findById(id);
    if (!existingContact) {
      throw new Error(`Contact with id ${id} not found`);
    }
    
    const updatedContact = new Contact(
      id,
      businessName,
      phone,
      address,
      note
    );
    
    await this.contactRepository.update(updatedContact);
    return updatedContact;
  }

  async deleteContact(id: string): Promise<void> {
    const existingContact = await this.contactRepository.findById(id);
    if (!existingContact) {
      throw new Error(`Contact with id ${id} not found`);
    }
    
    await this.contactRepository.delete(id);
  }

  async findOrCreateContact(
    businessName: string,
    phone: string,
    address: string,
    note?: string
  ): Promise<Contact> {
    const existingContact = await this.contactRepository.findByBusinessName(businessName);
    if (existingContact) {
      return existingContact;
    }
    
    return this.createContact(businessName, phone, address, note);
  }
}