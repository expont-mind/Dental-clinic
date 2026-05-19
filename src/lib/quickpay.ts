/**
 * QuickPay Merchant API — typed client for the proxy at QUICKPAY_MERCHANT_API.
 * The proxy handles QPay auth/token management automatically.
 */

type InvoiceResult = {
  id: string;
  qr_image: string;
  urls: { name: string; description: string; link: string }[];
};

type PaymentCheckResult = {
  invoice_id: string;
  payment_status: string;
  payment_amount: number;
  payment_date: string;
  rows: { payment_status: string }[];
};

class QuickPayService {
  private baseUrl: string;
  private apiKey: string | undefined;
  private platformMerchantId: string;
  private platformMccCode: string;
  private platformBankCode: string | undefined;
  private platformBankAccount: string | undefined;
  private platformBankName: string | undefined;

  constructor() {
    this.baseUrl = (
      process.env.QUICKPAY_MERCHANT_API ||
      "https://quickpay-merchant.vercel.app"
    ).replace(/\/$/, "");
    this.apiKey = process.env.QUICKPAY_API_KEY;
    this.platformMerchantId =
      process.env.QUICKPAY_PLATFORM_MERCHANT_ID ||
      "b200717d-e6c4-42e7-8889-24f51ed05cba";
    this.platformMccCode = process.env.QUICKPAY_PLATFORM_MCC_CODE || "5045";
    this.platformBankCode = process.env.QUICKPAY_PLATFORM_BANK_CODE;
    this.platformBankAccount = process.env.QUICKPAY_PLATFORM_BANK_ACCOUNT;
    this.platformBankName = process.env.QUICKPAY_PLATFORM_BANK_NAME;
  }

  isConfigured(): boolean {
    return Boolean(this.apiKey && this.platformBankCode && this.platformBankAccount);
  }

  private async request<T>(
    method: string,
    path: string,
    body?: unknown,
  ): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (this.apiKey) {
      headers["Authorization"] = `Bearer ${this.apiKey}`;
    }

    const options: RequestInit = { method, headers };
    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);
    const data = await response.json();

    if (!response.ok || data.success === false) {
      const errorMsg =
        data.error?.message || data.error || `QuickPay API error: ${response.status}`;
      const error = new Error(errorMsg) as Error & {
        status: number;
        details: unknown;
      };
      error.status = response.status;
      error.details = data.error?.details || data.details || data;
      throw error;
    }

    return (data.data !== undefined ? data.data : data) as T;
  }

  /** Create invoice using the platform merchant (for booking fees) */
  async createPlatformInvoice({
    amount,
    description,
    callbackUrl,
    customerName,
  }: {
    amount: number;
    description: string;
    callbackUrl: string;
    customerName?: string;
  }): Promise<InvoiceResult> {
    if (!this.platformBankCode || !this.platformBankAccount || !this.platformBankName) {
      throw new Error(
        "Platform bank account not configured. Set QUICKPAY_PLATFORM_BANK_CODE, QUICKPAY_PLATFORM_BANK_ACCOUNT, QUICKPAY_PLATFORM_BANK_NAME env vars.",
      );
    }

    const payload: Record<string, unknown> = {
      merchant_id: this.platformMerchantId,
      amount,
      currency: "MNT",
      mcc_code: this.platformMccCode,
      description,
      callback_url: callbackUrl,
      bank_accounts: [
        {
          account_bank_code: this.platformBankCode,
          account_number: this.platformBankAccount,
          account_name: this.platformBankName,
          is_default: true,
        },
      ],
    };
    if (customerName) payload.customer_name = customerName;

    return this.request<InvoiceResult>("POST", "/api/qpay/invoices", payload);
  }

  /** Check payment status for an invoice */
  async checkPayment(invoiceId: string): Promise<PaymentCheckResult> {
    return this.request<PaymentCheckResult>("POST", "/api/qpay/payments/check", {
      invoice_id: invoiceId,
    });
  }

  /** Cancel an invoice */
  async cancelInvoice(invoiceId: string): Promise<void> {
    await this.request("DELETE", `/api/qpay/invoices/${invoiceId}`);
  }
}

export const quickPayService = new QuickPayService();
