import { Router } from 'express';
import { InvoiceController } from './invoice.controller';
import { validate, validateQuery } from '../../middleware/validate.middleware';
import {
  createInvoiceSchema,
  updateInvoiceSchema,
  getInvoicesQuerySchema,
} from './invoice.dto';

const router = Router();

// In a real scenario, we'd add authentication middleware here
// router.use(authMiddleware);

router.post('/', validate(createInvoiceSchema), InvoiceController.create);
router.get('/stats', InvoiceController.getStats);
router.get('/', validateQuery(getInvoicesQuerySchema), InvoiceController.getAll);
router.get('/:id', InvoiceController.getById);
router.patch('/:id', validate(updateInvoiceSchema), InvoiceController.update);
router.delete('/:id', InvoiceController.delete);

export default router;
