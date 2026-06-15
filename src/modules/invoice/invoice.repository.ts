import { Invoice, IInvoice } from './invoice.model';

export class InvoiceRepository {
  async create(invoiceData: Partial<IInvoice>): Promise<IInvoice> {
    const invoice = new Invoice(invoiceData);
    return invoice.save();
  }

  async findById(id: string): Promise<IInvoice | null> {
    return Invoice.findById(id);
  }

  async update(id: string, updateData: Partial<IInvoice>): Promise<IInvoice | null> {
    return Invoice.findByIdAndUpdate(id, updateData, { new: true });
  }

  async delete(id: string): Promise<IInvoice | null> {
    return Invoice.findByIdAndDelete(id);
  }

  async findAll(
    filter: any,
    sort: any,
    skip: number,
    limit: number
  ): Promise<{ data: IInvoice[]; total: number }> {
    const [data, total] = await Promise.all([
      Invoice.find(filter).sort(sort).skip(skip).limit(limit),
      Invoice.countDocuments(filter),
    ]);
    return { data, total };
  }
  
  async getStats() {
    const stats = await Invoice.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' }
        }
      }
    ]);
    return stats;
  }
}
