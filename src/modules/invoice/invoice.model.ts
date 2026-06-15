import mongoose, { Schema, Document } from 'mongoose';

export enum InvoiceStatus {
  DRAFT = 'DRAFT',
  PENDING = 'PENDING',
  PAID = 'PAID',
  CANCELLED = 'CANCELLED',
  DISPUTED = 'DISPUTED',
}

export enum InvoiceType {
  PREPAID = 'PREPAID',
  POSTPAID = 'POSTPAID',
  RECURRING = 'RECURRING',
}

export interface IInvoice extends Document {
  invoiceNumber: string;
  merchantId: string;
  customerWallet: string;
  amount: number;
  token: string;
  status: InvoiceStatus;
  invoiceType: InvoiceType;
  description: string;
  dueDate: Date;
  blockchainInvoiceId?: string;
  blockchainTxHash?: string;
  createdAt: Date;
  updatedAt: Date;
}

const invoiceSchema = new Schema<IInvoice>(
  {
    invoiceNumber: { type: String, required: true, unique: true },
    merchantId: { type: String, required: true },
    customerWallet: { type: String, required: true },
    amount: { type: Number, required: true },
    token: { type: String, required: true },
    status: {
      type: String,
      enum: Object.values(InvoiceStatus),
      default: InvoiceStatus.DRAFT,
    },
    invoiceType: {
      type: String,
      enum: Object.values(InvoiceType),
      required: true,
    },
    description: { type: String, required: true },
    dueDate: { type: Date, required: true },
    blockchainInvoiceId: { type: String },
    blockchainTxHash: { type: String },
  },
  { timestamps: true }
);

export const Invoice = mongoose.model<IInvoice>('Invoice', invoiceSchema);
