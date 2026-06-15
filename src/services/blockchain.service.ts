export class BlockchainService {
  async createInvoiceOnChain(invoiceDetails: any): Promise<{ blockchainInvoiceId: string; txHash: string }> {
    // Mock blockchain delay
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    // Return mock data
    return {
      blockchainInvoiceId: `chain_inv_${Math.random().toString(36).substring(7)}`,
      txHash: `0x${Math.random().toString(16).substring(2, 66)}`,
    };
  }

  async getInvoiceOnChain(blockchainInvoiceId: string): Promise<any> {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return {
      status: 'active',
      blockchainInvoiceId,
    };
  }

  async cancelInvoiceOnChain(blockchainInvoiceId: string): Promise<{ txHash: string }> {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return {
      txHash: `0x${Math.random().toString(16).substring(2, 66)}`,
    };
  }
}
