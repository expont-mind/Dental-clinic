/**
 * QuickPay Merchant API Service
 *
 * HTTP client for the QuickPay Merchant API proxy at QUICKPAY_MERCHANT_API.
 * The proxy handles QPay authentication/token management automatically.
 *
 * Two merchant contexts:
 * - Platform merchant (ExgoChat): For billing invoices, credit top-ups
 * - Business merchants: Per-business QPay merchants for order/booking payments
 */

class QuickPayService {
  constructor() {
    this.baseUrl = (process.env.QUICKPAY_MERCHANT_API || 'https://quickpay-merchant.vercel.app').replace(/\/$/, '');
    this.apiKey = process.env.QUICKPAY_API_KEY;
    this.platformMerchantId = process.env.QUICKPAY_PLATFORM_MERCHANT_ID || 'b200717d-e6c4-42e7-8889-24f51ed05cba';
    this.platformMccCode = process.env.QUICKPAY_PLATFORM_MCC_CODE || '5045';
    this.platformBankCode = process.env.QUICKPAY_PLATFORM_BANK_CODE;
    this.platformBankAccount = process.env.QUICKPAY_PLATFORM_BANK_ACCOUNT;
    this.platformBankName = process.env.QUICKPAY_PLATFORM_BANK_NAME;
  }

  /**
   * Make HTTP request to QuickPay API
   */
  async _request(method, path, body = null) {
    const url = `${this.baseUrl}${path}`;
    const headers = { 'Content-Type': 'application/json' };
    if (this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`;
    }

    const options = {
      method,
      headers,
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    console.log(`🔄 QuickPay ${method} ${path} (apiKey: ${this.apiKey ? this.apiKey.substring(0, 8) + '...' : 'MISSING'})`);

    const response = await fetch(url, options);
    const data = await response.json();

    // Log raw response for payment check endpoints (critical for debugging)
    if (path.includes('/payments/check')) {
      console.log(`📋 QuickPay ${method} ${path} raw response:`, JSON.stringify(data, null, 2));
    }

    if (!response.ok || data.success === false) {
      const errorMsg = data.error?.message || data.error || `QuickPay API error: ${response.status}`;
      const details = data.error?.details || data.details || data;
      console.error(`❌ QuickPay ${method} ${path} failed:`, errorMsg);
      console.error(`❌ QuickPay details:`, JSON.stringify(details, null, 2));
      if (body) {
        console.error(`❌ QuickPay request body:`, JSON.stringify(body, null, 2));
      }
      const error = new Error(errorMsg);
      error.status = response.status;
      error.details = details;
      throw error;
    }

    return data.data !== undefined ? data.data : data;
  }

  // ─── Merchant Management ──────────────────────────────────────────

  /**
   * Create a company-type QPay merchant
   * @param {object} data - Company merchant details
   * @param {string} data.register_number - Company registration number
   * @param {string} data.company_name - Legal company name
   * @param {string} data.name - Business display name
   * @param {string} data.mcc_code - Merchant category code
   * @param {string} data.city - City/province code (e.g. "11000")
   * @param {string} data.district - District code (e.g. "17000")
   * @param {string} data.address - Business address
   * @param {string} data.phone - Contact phone
   * @param {string} data.email - Contact email
   * @param {string} [data.name_eng] - Business name in English
   * @param {string} [data.owner_first_name] - Owner first name
   * @param {string} [data.owner_last_name] - Owner last name
   */
  async createCompanyMerchant(data) {
    return this._request('POST', '/api/qpay/merchants/company', data);
  }

  /**
   * Create a person-type QPay merchant
   * @param {object} data - Person merchant details
   * @param {string} data.register_number - Person registration number
   * @param {string} data.first_name - First name
   * @param {string} data.last_name - Last name
   * @param {string} data.name - Business display name
   * @param {string} data.mcc_code - Merchant category code
   * @param {string} data.city - City/province code
   * @param {string} data.district - District code
   * @param {string} data.address - Business address
   * @param {string} data.phone - Contact phone
   * @param {string} data.email - Contact email
   */
  async createPersonMerchant(data) {
    return this._request('POST', '/api/qpay/merchants/person', data);
  }

  /**
   * Get merchant details by ID
   */
  async getMerchant(merchantId) {
    return this._request('GET', `/api/qpay/merchants/${merchantId}`);
  }

  /**
   * Delete a merchant
   */
  async deleteMerchant(merchantId) {
    return this._request('DELETE', `/api/qpay/merchants/${merchantId}`);
  }

  /**
   * List merchants (paginated)
   * @param {number} page - Page number (default 1)
   * @param {number} limit - Items per page (default 20)
   */
  async listMerchants(page = 1, limit = 20) {
    return this._request('POST', '/api/qpay/merchants', { page, limit });
  }

  // ─── Invoice Management ───────────────────────────────────────────

  /**
   * Create a payment invoice
   * @param {object} params
   * @param {string} params.merchantId - QPay merchant UUID
   * @param {number} params.amount - Payment amount in MNT
   * @param {string} [params.currency="MNT"] - Currency code
   * @param {string} params.mccCode - Merchant category code
   * @param {string} params.description - Payment description
   * @param {string} [params.customerName] - Customer name
   * @param {string} params.callbackUrl - Webhook callback URL
   * @param {Array} params.bankAccounts - Settlement bank accounts
   * @param {string} params.bankAccounts[].account_bank_code - Bank code
   * @param {string} params.bankAccounts[].account_number - Account number
   * @param {string} params.bankAccounts[].account_name - Account holder name
   * @param {boolean} [params.bankAccounts[].is_default=true] - Default account
   * @returns {Promise<{id: string, qr_image: string, urls: Array}>}
   */
  async createInvoice({ merchantId, amount, currency = 'MNT', mccCode, description, customerName, callbackUrl, bankAccounts }) {
    const payload = {
      merchant_id: merchantId,
      amount,
      currency,
      mcc_code: mccCode,
      description,
      callback_url: callbackUrl,
      bank_accounts: bankAccounts,
    };

    if (customerName) {
      payload.customer_name = customerName;
    }

    return this._request('POST', '/api/qpay/invoices', payload);
  }

  /**
   * Get invoice details
   */
  async getInvoice(invoiceId) {
    return this._request('GET', `/api/qpay/invoices/${invoiceId}`);
  }

  /**
   * Cancel an invoice
   */
  async cancelInvoice(invoiceId) {
    return this._request('DELETE', `/api/qpay/invoices/${invoiceId}`);
  }

  // ─── Payment Verification ─────────────────────────────────────────

  /**
   * Check payment status for an invoice
   * @param {string} invoiceId - QuickPay invoice UUID
   * @returns {Promise<{invoice_id: string, payment_status: string, payment_amount: number, payment_date: string}>}
   */
  async checkPayment(invoiceId) {
    return this._request('POST', '/api/qpay/payments/check', {
      invoice_id: invoiceId,
    });
  }

  // ─── Reference Data ───────────────────────────────────────────────

  /**
   * Get all provinces/cities
   */
  async getProvinces() {
    return this._request('GET', '/api/qpay/reference/provinces');
  }

  /**
   * Get districts by province code
   */
  async getDistricts(provinceCode) {
    return this._request('GET', `/api/qpay/reference/districts/${provinceCode}`);
  }

  // ─── Convenience Methods ──────────────────────────────────────────

  /**
   * Create invoice using the platform (ExgoChat) merchant
   * Used for: subscription invoices, credit top-ups, onboarding payments
   */
  async createPlatformInvoice({ amount, description, callbackUrl, customerName }) {
    if (!this.platformBankCode || !this.platformBankAccount || !this.platformBankName) {
      throw new Error('Platform bank account not configured. Set QUICKPAY_PLATFORM_BANK_CODE, QUICKPAY_PLATFORM_BANK_ACCOUNT, QUICKPAY_PLATFORM_BANK_NAME env vars.');
    }

    return this.createInvoice({
      merchantId: this.platformMerchantId,
      amount,
      currency: 'MNT',
      mccCode: this.platformMccCode,
      description,
      customerName,
      callbackUrl,
      bankAccounts: [{
        account_bank_code: this.platformBankCode,
        account_number: this.platformBankAccount,
        account_name: this.platformBankName,
        is_default: true,
      }],
    });
  }

  /**
   * Create invoice using a business's own QPay merchant
   * Used for: customer order payments, booking payments
   */
  async createBusinessInvoice({ merchantId, amount, description, callbackUrl, customerName, bankAccountCode, bankAccountNumber, bankAccountName, mccCode }) {
    return this.createInvoice({
      merchantId,
      amount,
      currency: 'MNT',
      mccCode: mccCode || '5812',
      description,
      customerName,
      callbackUrl,
      bankAccounts: [{
        account_bank_code: bankAccountCode,
        account_number: bankAccountNumber,
        account_name: bankAccountName,
        is_default: true,
      }],
    });
  }
}

export const quickPayService = new QuickPayService();
