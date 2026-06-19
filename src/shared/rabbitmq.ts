import amqp, { Connection, Channel } from 'amqplib';
import { logger } from './logger';

export class RabbitMQClient {
  private connection: any = null;
  private channel: any = null;
  private url: string;

  constructor(url: string) {
    this.url = url;
  }

  async connect(): Promise<void> {
    try {
      this.connection = await amqp.connect(this.url);
      this.channel = await this.connection.createChannel();
      logger.info('Connected to RabbitMQ');
    } catch (error) {
      logger.error('Failed to connect to RabbitMQ', error);
      throw error;
    }
  }

  async publish(exchange: string, routingKey: string, message: any): Promise<void> {
    if (!this.channel) throw new Error('Channel not initialized');
    
    await this.channel.assertExchange(exchange, 'topic', { durable: true });
    this.channel.publish(exchange, routingKey, Buffer.from(JSON.stringify(message)));
    logger.info(`Published message to ${exchange} with routing key ${routingKey}`);
  }

  async consume(queueName: string, exchange: string, routingKey: string, callback: (msg: any) => void): Promise<void> {
    if (!this.channel) throw new Error('Channel not initialized');

    await this.channel.assertExchange(exchange, 'topic', { durable: true });
    const q = await this.channel.assertQueue(queueName, { durable: true });
    
    await this.channel.bindQueue(q.queue, exchange, routingKey);
    
    this.channel.consume(q.queue, (msg: any) => {
      if (msg) {
        try {
          const content = JSON.parse(msg.content.toString());
          callback(content);
          this.channel?.ack(msg);
        } catch (error) {
          logger.error('Error processing message', error);
          // Depending on logic, might reject or nack
          this.channel?.nack(msg, false, false);
        }
      }
    });
    logger.info(`Started consuming from queue ${queueName}`);
  }

  async close(): Promise<void> {
    if (this.channel) await this.channel.close();
    if (this.connection) await this.connection.close();
  }
}
