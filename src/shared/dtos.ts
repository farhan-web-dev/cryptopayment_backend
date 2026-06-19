import { z } from 'zod';

export const CreateInvoiceDto = z.object({
  merchantId: z.string(),
  customerWallet: z.string(),
  amount: z.number().positive(),
  token: z.string(),
  invoiceType: z.string().optional()
});

export type CreateInvoiceDtoType = z.infer<typeof CreateInvoiceDto>;

export const CreatePaymentDto = z.object({
  invoiceId: z.string(),
  payerWallet: z.string(),
  amount: z.number().positive(),
  token: z.string()
});

export type CreatePaymentDtoType = z.infer<typeof CreatePaymentDto>;
