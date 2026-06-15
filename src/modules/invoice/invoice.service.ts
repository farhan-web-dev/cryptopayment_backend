import { InvoiceRepository } from './invoice.repository';
import { BlockchainService } from '../../services/blockchain.service';
import { IInvoice, InvoiceStatus } from './invoice.model';
import { v4 as uuidv4 } from 'uuid';

export class InvoiceService {
  private repository: InvoiceRepository;
  private blockchainService: BlockchainService;

  constructor() {
    this.repository = new InvoiceRepository();
    this.blockchainService = new BlockchainService();
  }

  async createInvoice(data: Partial<IInvoice>): Promise<IInvoice> {
    // Generate unique invoice number
    const invoiceNumber = `INV-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    
    // In a real app, merchantId would come from the authenticated user
    const merchantId = 'merchant_123';

    // Call blockchain service
    const onChainData = await this.blockchainService.createInvoiceOnChain({
      ...data,
      invoiceNumber,
    });

    const invoiceData = {
      ...data,
      invoiceNumber,
      merchantId,
      status: InvoiceStatus.PENDING,
      blockchainInvoiceId: onChainData.blockchainInvoiceId,
      blockchainTxHash: onChainData.txHash,
    };

    return this.repository.create(invoiceData);
  }

  async getInvoices(filter: any, sort: any, page: number, limit: number) {
    const skip = (page - 1) * limit;
    return this.repository.findAll(filter, sort, skip, limit);
  }

  async getInvoiceById(id: string) {
    const invoice = await this.repository.findById(id);
    if (!invoice) {
      const error: any = new Error('Invoice not found');
      error.statusCode = 404;
      throw error;
    }
    return invoice;
  }

  async updateInvoice(id: string, updateData: Partial<IInvoice>) {
    const invoice = await this.repository.update(id, updateData);
    if (!invoice) {
      const error: any = new Error('Invoice not found');
      error.statusCode = 404;
      throw error;
    }
    return invoice;
  }

  async deleteInvoice(id: string) {
    const invoice = await this.getInvoiceById(id);
    
    if (invoice.blockchainInvoiceId) {
       await this.blockchainService.cancelInvoiceOnChain(invoice.blockchainInvoiceId);
    }

    return this.repository.delete(id);
  }

  async getStats() {
    return this.repository.getStats();
  }
}
