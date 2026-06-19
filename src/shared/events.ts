export enum EventTopics {
  InvoiceCreated = 'invoice.created',
  InvoiceUpdated = 'invoice.updated',
  InvoiceCancelled = 'invoice.cancelled',
  PaymentCreated = 'payment.created',
  PaymentCompleted = 'payment.completed',
  PaymentFailed = 'payment.failed'
}

export interface InvoiceCreatedEvent {
  invoiceId: string;
  invoiceNumber: string;
  amount: number;
  token: string;
}

export interface PaymentCreatedEvent {
  paymentId: string;
  invoiceId: string;
  amount: number;
}

export interface PaymentCompletedEvent {
  paymentId: string;
  invoiceId: string;
  txHash: string;
}
