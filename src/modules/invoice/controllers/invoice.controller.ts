import { Request, Response } from 'express';
import { Invoice } from '../models/Invoice';
import { RabbitMQClient, EventTopics, CreateInvoiceDto, logger } from '../../../shared';

let rabbitClient: RabbitMQClient;

export const setRabbitClient = (client: RabbitMQClient) => {
  rabbitClient = client;
};

export const createInvoice = async (req: Request, res: Response) => {
  try {
    const data = CreateInvoiceDto.parse(req.body);
    
    const invoiceNumber = `INV-${Date.now()}`;
    const invoice = new Invoice({
      ...data,
      invoiceNumber
    });

    await invoice.save();

    if (rabbitClient) {
      await rabbitClient.publish('crypto_exchange', EventTopics.InvoiceCreated, {
        invoiceId: invoice._id,
        invoiceNumber: invoice.invoiceNumber,
        amount: invoice.amount,
        token: invoice.token
      });
    }

    res.status(201).json(invoice);
  } catch (error) {
    logger.error('Error creating invoice', error);
    res.status(400).json({ error: 'Failed to create invoice' });
  }
};

export const getInvoices = async (req: Request, res: Response) => {
  try {
    const invoices = await Invoice.find().sort({ createdAt: -1 });
    res.json(invoices);
  } catch (error) {
    logger.error('Error getting invoices', error);
    res.status(500).json({ error: 'Failed to fetch invoices' });
  }
};

export const getInvoiceById = async (req: Request, res: Response) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) return res.status(404).json({ error: 'Invoice not found' });
    res.json(invoice);
  } catch (error) {
    logger.error('Error getting invoice', error);
    res.status(500).json({ error: 'Failed to fetch invoice' });
  }
};

export const updateInvoice = async (req: Request, res: Response) => {
  try {
    const invoice = await Invoice.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!invoice) return res.status(404).json({ error: 'Invoice not found' });

    if (rabbitClient) {
      await rabbitClient.publish('crypto_exchange', EventTopics.InvoiceUpdated, {
        invoiceId: invoice._id,
        status: invoice.status
      });
    }

    res.json(invoice);
  } catch (error) {
    logger.error('Error updating invoice', error);
    res.status(500).json({ error: 'Failed to update invoice' });
  }
};

export const deleteInvoice = async (req: Request, res: Response) => {
  try {
    const invoice = await Invoice.findByIdAndDelete(req.params.id);
    if (!invoice) return res.status(404).json({ error: 'Invoice not found' });

    if (rabbitClient) {
      await rabbitClient.publish('crypto_exchange', EventTopics.InvoiceCancelled, {
        invoiceId: invoice._id
      });
    }

    res.json({ message: 'Invoice deleted successfully' });
  } catch (error) {
    logger.error('Error deleting invoice', error);
    res.status(500).json({ error: 'Failed to delete invoice' });
  }
};




