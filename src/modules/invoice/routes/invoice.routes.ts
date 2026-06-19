import { Router } from 'express';
import {
  createInvoice,
  getInvoices,
  getInvoiceById,
  updateInvoice,
  deleteInvoice
} from '../controllers/invoice.controller';

const router = Router();

router.post('/', createInvoice);
router.get('/', getInvoices);
router.get('/:id', getInvoiceById);
router.patch('/:id', updateInvoice);
router.delete('/:id', deleteInvoice);

export default router;
