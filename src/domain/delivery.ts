import { Recipient } from './recipient';

// Aggregate Root
export class Delivery {
  constructor(
    readonly id: string,
    public recipient: Recipient,
    public pickupPlace: string,
    public boxCount: number,
    public settlement: 'PREPAID' | 'COLLECT' | 'OFFICE' | 'RECEIPT_REQUIRED',
    public fee: number | null,
    public note?: string,
    public status: 'PICKED_UP' | 'DELIVERED' | 'SETTLED' = 'PICKED_UP'
  ) {}

  deliver() {
    if (this.status !== 'PICKED_UP') throw new Error('Cannot deliver: delivery is not in PICKED_UP status');
    this.status = 'DELIVERED';
  }

  settle() {
    if (this.status !== 'DELIVERED') throw new Error('Cannot settle: delivery is not in DELIVERED status');
    this.status = 'SETTLED';
  }
}

// Domain Event (for future extension)
export class DeliveryStatusChanged {
  constructor(
    public readonly deliveryId: string,
    public readonly oldStatus: 'PICKED_UP' | 'DELIVERED' | 'SETTLED',
    public readonly newStatus: 'PICKED_UP' | 'DELIVERED' | 'SETTLED',
    public readonly timestamp: Date = new Date()
  ) {}
}