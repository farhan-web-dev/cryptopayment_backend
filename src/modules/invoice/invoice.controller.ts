import { Request, Response } from 'express';
import { InvoiceService } from './invoice.service';

const invoiceService = new InvoiceService();

export class InvoiceController {
  static async create(req: Request, res: Response) {
    const invoice = await invoiceService.createInvoice(req.body);
    res.status(201).json({ status: 'success', data: invoice });
  }

  static async getAll(req: Request, res: Response) {
    const { page, limit, status, sortBy, sortOrder } = req.query;

    const filter: any = {};
    if (status) filter.status = status;

    const sort: any = {};
    if (sortBy) {
      sort[sortBy as string] = sortOrder === 'desc' ? -1 : 1;
    }

    const result = await invoiceService.getInvoices(
      filter,
      sort,
      Number(page),
      Number(limit)
    );

    res.status(200).json({
      status: 'success',
      data: result.data,
      meta: {
        total: result.total,
        page: Number(page),
        limit: Number(limit),
      },
    });
  }

  static async getById(req: Request, res: Response) {
    const invoice = await invoiceService.getInvoiceById(req.params.id);
    res.status(200).json({ status: 'success', data: invoice });
  }

  static async update(req: Request, res: Response) {
    const invoice = await invoiceService.updateInvoice(req.params.id, req.body);
    res.status(200).json({ status: 'success', data: invoice });
  }

  static async delete(req: Request, res: Response) {
    await invoiceService.deleteInvoice(req.params.id);
    res.status(204).send();
  }

  static async getStats(req: Request, res: Response) {
    const stats = await invoiceService.getStats();
    res.status(200).json({ status: 'success', data: stats });
  }
}
