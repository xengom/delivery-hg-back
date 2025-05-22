// Value Object
export class Address {
  constructor(
    readonly full: string,
    readonly lat?: number,
    readonly lng?: number
  ) {}
}

// Entity
export class Recipient {
  constructor(
    readonly id: string,
    public name: string | null,
    public phone: string,
    public address: Address,
    public memo?: string
  ) {}
}