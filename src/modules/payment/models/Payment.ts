import mongoose, { Schema, Document } from 'mongoose';

export interface IPayment extends Document {
  paymentId: string;
  invoiceId: string;
  payerWallet: string;
  amount: number;
  token: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  txHash?: string;
  createdAt: Date;
}

const PaymentSchema: Schema = new Schema({
  paymentId: { type: String, required: true, unique: true },
  invoiceId: { type: String, required: true },
  payerWallet: { type: String, required: true },
  amount: { type: Number, required: true },
  token: { type: String, required: true },
  status: { type: String, enum: ['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED'], default: 'PENDING' },
  txHash: { type: String },
  createdAt: { type: Date, default: Date.now }
});

export const Payment = mongoose.model<IPayment>('Payment', PaymentSchema);
