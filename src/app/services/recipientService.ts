import { nanoid } from 'nanoid';
import { Recipient, Address } from '../../domain/recipient';
import { RecipientRepository } from '../repos/repository-interfaces';

export class RecipientService {
  constructor(private recipientRepository: RecipientRepository) {}

  async findById(id: string): Promise<Recipient | null> {
    return this.recipientRepository.findById(id);
  }

  async search(query: string): Promise<Recipient[]> {
    return this.recipientRepository.search(query);
  }

  async createRecipient(
    name: string | null,
    phone: string,
    address: string,
    memo?: string,
    lat?: number,
    lng?: number
  ): Promise<Recipient> {
    const recipient = new Recipient(
      nanoid(),
      name,
      phone,
      new Address(address, lat, lng),
      memo
    );
    
    await this.recipientRepository.save(recipient);
    return recipient;
  }

  async updateRecipient(
    id: string,
    name: string | null,
    phone: string,
    address: string,
    memo?: string,
    lat?: number,
    lng?: number
  ): Promise<Recipient> {
    const existingRecipient = await this.recipientRepository.findById(id);
    if (!existingRecipient) {
      throw new Error(`Recipient with id ${id} not found`);
    }
    
    const updatedRecipient = new Recipient(
      id,
      name,
      phone,
      new Address(address, lat, lng),
      memo
    );
    
    await this.recipientRepository.update(updatedRecipient);
    return updatedRecipient;
  }

  async deleteRecipient(id: string): Promise<void> {
    const existingRecipient = await this.recipientRepository.findById(id);
    if (!existingRecipient) {
      throw new Error(`Recipient with id ${id} not found`);
    }
    
    await this.recipientRepository.delete(id);
  }
}