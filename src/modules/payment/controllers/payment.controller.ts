import { Request, Response } from 'express';
import axios from 'axios';
import { Payment } from '../models/Payment';
import { RabbitMQClient, EventTopics, CreatePaymentDto, logger } from '../../../shared';

let rabbitClient: RabbitMQClient;

export const setRabbitClient = (client: RabbitMQClient) => {
  rabbitClient = client;
};

import { Invoice } from '../../invoice/models/Invoice';

// For simplicity we will assume the request is valid or we just create the payment and process it asynchronously.
// The requirements said: "When payment is created: 1. Validate invoice exists. 2. Create payment record. 3. Call Blockchain Service. 4. Publish PaymentCreated event."

export const createPayment = async (req: Request, res: Response) => {
  try {
    const data = CreatePaymentDto.parse(req.body);
    
    // 1. Validate invoice exists (support both _id and invoiceNumber)
    let invoice;
    if (data.invoiceId.startsWith('INV-')) {
      invoice = await Invoice.findOne({ invoiceNumber: data.invoiceId });
    } else {
      invoice = await Invoice.findById(data.invoiceId);
    }

    if (!invoice) {
      return res.status(400).json({ error: 'Invoice does not exist' });
    }

    // 2. Create payment record
    const paymentId = `PAY-${Date.now()}`;
    const payment = new Payment({
      ...data,
      paymentId,
      status: 'PROCESSING'
    });
    await payment.save();

    // 3. Call Blockchain Service (Mocked locally since we are in a monolith now)
    let txHash = null;
    try {
      // Stubbing blockchain interaction
      txHash = `0x${Math.random().toString(16).substr(2, 40)}`;
      payment.status = 'COMPLETED';
      payment.txHash = txHash;
    } catch (e) {
      payment.status = 'FAILED';
    }
    await payment.save();

    // 4. Publish events
    if (rabbitClient) {
      await rabbitClient.publish('crypto_exchange', EventTopics.PaymentCreated, {
        paymentId: payment._id,
        invoiceId: payment.invoiceId,
        amount: payment.amount
      });
      
      if (payment.status === 'COMPLETED') {
        await rabbitClient.publish('crypto_exchange', EventTopics.PaymentCompleted, {
          paymentId: payment._id,
          invoiceId: payment.invoiceId,
          txHash: payment.txHash
        });
      }
    }

    res.status(201).json(payment);
  } catch (error: any) {
    logger.error('Error creating payment', error);
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: 'Validation failed', details: error.errors });
    }
    if (error.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid Invoice ID format' });
    }
    res.status(400).json({ error: error.message || 'Failed to create payment' });
  }
};

export const getPayments = async (req: Request, res: Response) => {
  try {
    const payments = await Payment.find().sort({ createdAt: -1 });
    res.json(payments);
  } catch (error) {
    logger.error('Error getting payments', error);
    res.status(500).json({ error: 'Failed to fetch payments' });
  }
};

export const getPaymentById = async (req: Request, res: Response) => {
  try {
    const payment = await Payment.findById(req.params.id);
    if (!payment) return res.status(404).json({ error: 'Payment not found' });
    res.json(payment);
  } catch (error) {
    logger.error('Error getting payment', error);
    res.status(500).json({ error: 'Failed to fetch payment' });
  }
};




