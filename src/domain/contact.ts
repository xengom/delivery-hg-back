export class Contact {
  constructor(
    readonly id: string,
    public businessName: string,
    public phone: string,
    public address: string,
    public note?: string
  ) {}
}