import Joi from 'joi';
import { InvoiceStatus, InvoiceType } from './invoice.model';

export const createInvoiceSchema = Joi.object({
  customerWallet: Joi.string().required(),
  amount: Joi.number().positive().required(),
  token: Joi.string().required(),
  invoiceType: Joi.string().valid(...Object.values(InvoiceType)).required(),
  description: Joi.string().required(),
  dueDate: Joi.date().iso().required(),
});

export const updateInvoiceSchema = Joi.object({
  status: Joi.string().valid(...Object.values(InvoiceStatus)),
  description: Joi.string(),
  dueDate: Joi.date().iso(),
});

export const getInvoicesQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  status: Joi.string().valid(...Object.values(InvoiceStatus)),
  sortBy: Joi.string().valid('createdAt', 'dueDate', 'amount').default('createdAt'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
});
