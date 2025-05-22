import { nanoid } from 'nanoid';
import { Delivery, DeliveryStatusChanged } from '../../domain/delivery';
import { Recipient } from '../../domain/recipient';
import { DeliveryRepository } from '../repos/repository-interfaces';

export class DeliveryService {
  constructor(private deliveryRepository: DeliveryRepository) {}

  async findById(id: string): Promise<Delivery | null> {
    return this.deliveryRepository.findById(id);
  }

  async findAll(): Promise<Delivery[]> {
    return this.deliveryRepository.findAll();
  }

  async register(
    recipient: Recipient,
    pickupPlace: string,
    boxCount: number,
    settlement: 'PREPAID' | 'COLLECT' | 'OFFICE' | 'RECEIPT_REQUIRED',
    fee: number | null,
    note?: string
  ): Promise<Delivery> {
    const delivery = new Delivery(
      nanoid(),
      recipient,
      pickupPlace,
      boxCount,
      settlement,
      fee,
      note
    );
    
    await this.deliveryRepository.save(delivery);
    return delivery;
  }

  async changeStatus(id: string, newStatus: 'PICKED_UP' | 'DELIVERED' | 'SETTLED'): Promise<void> {
    const delivery = await this.deliveryRepository.findById(id);
    if (!delivery) {
      throw new Error(`Delivery with id ${id} not found`);
    }
    
    const oldStatus = delivery.status;
    
    // Apply domain logic
    if (newStatus === 'DELIVERED' && oldStatus !== 'PICKED_UP') {
      throw new Error('Cannot deliver: delivery is not in PICKED_UP status');
    }
    
    if (newStatus === 'SETTLED' && oldStatus !== 'DELIVERED') {
      throw new Error('Cannot settle: delivery is not in DELIVERED status');
    }
    
    // Update status in repository
    await this.deliveryRepository.updateStatus(id, newStatus);
    
    // Create domain event (for future extension)
    const event = new DeliveryStatusChanged(id, oldStatus, newStatus);
    this.publishEvent(event);
  }

  async getDailyStats(startDate: string, endDate: string): Promise<any[]> {
    return this.deliveryRepository.getDailyStats(startDate, endDate);
  }

  async getMonthlyStats(yearMonth: string): Promise<any[]> {
    return this.deliveryRepository.getMonthlyStats(yearMonth);
  }

  // Method to handle domain events (for future extension)
  private publishEvent(event: DeliveryStatusChanged): void {
    // In a real application, this would publish the event to an event bus
    console.log('Event published:', event);
  }
}

// Factory pattern for creating Delivery objects from input
export class DeliveryFactory {
  static createFromInput(form: any, recipient: Recipient): Delivery {
    return new Delivery(
      nanoid(),
      recipient,
      form.pickupPlace,
      form.boxCount,
      form.settlement,
      form.fee,
      form.note
    );
  }
}