export interface IAddress {
  id: number;
  street: string;
  city: string;
  postal_code: string;
}

export type IAddAddress = Omit<IAddress, 'id'>;
export type IEditAddress = Partial<IAddAddress>;
