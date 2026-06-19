import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import mongoose from 'mongoose';
import { logger } from './shared/logger';
import { RabbitMQClient } from './shared/rabbitmq';
import { EventTopics } from './shared/events';

// Import routers
import invoiceRoutes from './modules/invoice/routes/invoice.routes';
import paymentRoutes from './modules/payment/routes/payment.routes';

// Import rabbit setters
import { setRabbitClient as setInvoiceRabbitClient } from './modules/invoice/controllers/invoice.controller';
import { setRabbitClient as setPaymentRabbitClient } from './modules/payment/controllers/payment.controller';

dotenv.config();

const app = express();

app.use(cors({
  origin: ['http://localhost:3000', 'https://cryptopayment-frontend.vercel.app'],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  credentials: true
}));
app.use(express.json());

app.use((req, res, next) => {
  logger.info(`Incoming request: ${req.method} ${req.url}`);
  next();
});

// Mount modular routes
app.use('/api/invoices', invoiceRoutes);
app.use('/api/payments', paymentRoutes);
// You can add more routes here (auth, notification, etc) when they are implemented

const PORT = process.env.PORT || 8080;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/crypto_payment_db';
const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost:5672';

async function start() {
  try {
    // 1. Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    logger.info('Connected to MongoDB');

    // 2. Connect to RabbitMQ
    const rabbitClient = new RabbitMQClient(RABBITMQ_URL);
    let retries = 5;
    while (retries > 0) {
      try {
        await rabbitClient.connect();
        logger.info('Connected to RabbitMQ in Monolith');

        // Pass client to controllers that need to publish events
        setInvoiceRabbitClient(rabbitClient);
        setPaymentRabbitClient(rabbitClient);

        // Setup consumer logic inside monolith (e.g. payment module consuming invoice created event)
        await rabbitClient.consume('payment_service_invoice_q', 'crypto_exchange', EventTopics.InvoiceCreated, async (msg) => {
          logger.info(`[Monolith] Payment Module Received InvoiceCreated: ${msg.invoiceId}`);
          // payment creation or processing logic here
        });

        break;
      } catch (err) {
        retries -= 1;
        logger.warn(`Waiting for RabbitMQ... (${retries} retries left)`);
        await new Promise(res => setTimeout(res, 5000));
      }
    }

    // 3. Start Express server
    app.listen(PORT, () => {
      logger.info(`Monolithic API running on port ${PORT}`);
    });
  } catch (error) {
    logger.error('Failed to start monolith server', error);
    process.exit(1);
  }
}

start();
