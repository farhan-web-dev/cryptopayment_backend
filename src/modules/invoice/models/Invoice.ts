import mongoose, { Schema, Document } from 'mongoose';

export interface IInvoice extends Document {
  invoiceNumber: string;
  merchantId: string;
  customerWallet: string;
  amount: number;
  token: string;
  invoiceType: string;
  status: 'PENDING' | 'PAID' | 'CANCELLED';
  blockchainInvoiceId?: string;
  createdAt: Date;
}

const InvoiceSchema: Schema = new Schema({
  invoiceNumber: { type: String, required: true, unique: true },
  merchantId: { type: String, required: true },
  customerWallet: { type: String, required: true },
  amount: { type: Number, required: true },
  token: { type: String, required: true },
  invoiceType: { type: String, default: 'STANDARD' },
  status: { type: String, enum: ['PENDING', 'PAID', 'CANCELLED'], default: 'PENDING' },
  blockchainInvoiceId: { type: String },
  createdAt: { type: Date, default: Date.now }
});

export const Invoice = mongoose.model<IInvoice>('Invoice', InvoiceSchema);
