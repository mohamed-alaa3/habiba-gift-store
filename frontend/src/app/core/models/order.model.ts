import { LocalizedText, ObjectId } from './api-response.model';
import { AddressSnapshot } from './address.model';
import { SelectedOption } from './cart.model';

export type OrderStatus =
  'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';
export type PaymentMethod = 'cod';

export interface OrderItem {
  product: ObjectId | null;
  nameSnapshot: LocalizedText;
  imageSnapshot: string;
  imageUrl?: string;
  priceAtPurchase: number;
  quantity: number;
  selectedOptions: SelectedOption[];
  subtotal: number;
  type?: 'product' | 'gift-box';
  giftBox?: any;
}

export interface Order {
  _id: ObjectId;
  user: ObjectId | { _id: ObjectId; name: string; email: string };
  orderNumber: string;
  items: OrderItem[];
  shippingAddress: AddressSnapshot;
  subtotal: number;
  shippingFee: number;
  tax: number;
  discount: number;
  total: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

// ---------- Gift Box Payload ----------
export interface GiftBoxOrderPayload {
  boxId: ObjectId;
  items: Array<{ productId: ObjectId; quantity: number }>;
  wrapStyleId?: ObjectId | null;
  ribbonId?: ObjectId | null;
  note?: string;
}

// ---------- Create / Update ----------
export interface CreateOrderPayload {
  shippingAddress: AddressSnapshot;
  notes?: string;
  giftBox?: GiftBoxOrderPayload;
}

export interface UpdateOrderStatusPayload {
  status: OrderStatus;
}

export interface OrderQuery {
  status?: OrderStatus;
  page?: number;
  limit?: number;
}

export interface OrderTracking {
  orderNumber: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  createdAt: string;
  updatedAt: string;
}
