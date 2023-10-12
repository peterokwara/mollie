/**
 * Interface for Mollie customer
 */
interface MollieCustomer {
  /**
   * Customer name
   */
  name?: string;

  /**
   * Customer email
   */
  email?: string;

  /**
   * Customer locale
   */
  locale?: string;

  /**
   * Customer metadata
   */
  metadata?: {
    [key: string]: any;
  };
}

/**
 * Interface for subscription info
 */
interface SubscriptionInfo {
  /**
   * Amount
   */
  amount: {
    /**
     * The currency
     */
    currency: string;
    /**
     * The value
     */
    value: string;
  };
  /**
   * The number of times the subscription should recur
   */
  times?: number;
  /**
   * The interval to wait between charges
   */
  interval: string;
  /**
   * The description of the subscription
   */
  description: string;
  /**
   * The webhook URL
   */
  webhookUrl: string;
  /**
   * The mandate ID
   */
  mandateId: string;

  /**
   * The customer ID
   */
  customerId: string;
}

/**
 * Interface for first payment
 */
interface MolliePayment {
  /**
   * The customer ID from Mollie
   */
  customerId: string;

  /**
   * Payment information
   */
  description: string;

  /**
   * Enables recurring payment
   */
  sequenceType: string;

  /**
   * Redirect URL after payment
   */
  redirectUrl?: string;

  /**
   * Webhook URL
   */
  webhookUrl?: string;

  /**
   * Cancel URL
   */
  cancelUrl?: string;

  /**
   * Amount
   */
  amount: {
    /**
     * The currency
     */
    currency: string;

    /**
     * The value
     */
    value: string;
  };

  /**
   * Mandate ID
   */
  mandateId?: string;
}

export class MollieService {
  private _mollieConfiguration: any;

  constructor() {
    this._mollieConfiguration = {
      mollieApiKey:
        process.env.NODE_ENV === "production"
          ? process.env.LIVE_MOLLIE_API_KEY
          : process.env.TEST_MOLLIE_API_KEY,
    };
  }

  /**
   * Create a mollie customer
   * @param name Customer name
   * @param email Customer email
   * @param locale Customer locale
   * @param metadata Customer metadata
   * @returns customerId
   */
  async createCustomer(customer: MollieCustomer) {
    if (!customer.name) {
      throw new Error("Customer name is required");
    }
    const params = new URLSearchParams();

    params.append("name", customer.name || "");
    params.append("email", customer.email || "");
    params.append("locale", customer.locale || "");
    params.append("metadata", JSON.stringify(customer.metadata));

    try {
      const response = await fetch("https://api.mollie.com/v2/customers", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this._mollieConfiguration.mollieApiKey}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: params,
      });

      const data = await response.json();

      return {
        ...data,
      };
    } catch (error: any) {
      throw new Error(error);
    }
  }

  /**
   * Create a payment
   * @param payment Payment information
   */
  async createPayment(payment: MolliePayment) {
    if (!payment.customerId) {
      throw new Error("Customer ID is required");
    }

    if (!payment.sequenceType) {
      throw new Error("Sequence type is required");
    }

    if (!payment.description) {
      throw new Error("Description is required");
    }

    if (!payment.amount.currency || !payment.amount.value) {
      throw new Error("Amount is required");
    }

    const params = new URLSearchParams();

    params.append("sequenceType", payment.sequenceType);
    params.append("description", payment.description);
    params.append("amount[currency]", payment.amount.currency);
    params.append("amount[value]", payment.amount.value);
    params.append("redirectUrl", payment.redirectUrl || "");

    try {
      const response = await fetch(
        `https://api.mollie.com/v2/customers/${payment.customerId}/payments`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${this._mollieConfiguration.mollieApiKey}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: params,
        }
      );

      const data = await response.json();
      return {
        ...data,
      };
    } catch (error: any) {
      throw new Error("Failed to create payment");
    }
  }

  /**
   * Function to fetch a mandate given a customer ID
   * @param customerId The customer ID
   * @returns Mandates info
   */
  async getMandate(customerId: string) {
    try {
      const response = await fetch(
        `https://api.mollie.com/v2/customers/${customerId}/mandates`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${this._mollieConfiguration.mollieApiKey}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );

      const data = await response.json();
      return {
        ...data,
      };
    } catch (error: any) {
      throw new Error("Failed to create payment");
    }
  }

  async createSubscription(subscriptionInfo: SubscriptionInfo) {
    const params = new URLSearchParams();

    if (!subscriptionInfo.webhookUrl) {
      throw new Error("Webhook URL is required");
    }

    if (!subscriptionInfo.mandateId) {
      throw new Error("Mandate ID is required");
    }

    if (!subscriptionInfo.description) {
      throw new Error("Description is required");
    }

    if (!subscriptionInfo.customerId) {
      throw new Error("Customer ID is required");
    }

    params.append("amount[currency]", subscriptionInfo.amount.currency);
    params.append("amount[value]", subscriptionInfo.amount.value);
    params.append("interval", subscriptionInfo.interval);
    params.append("description", subscriptionInfo.description);
    params.append("times", subscriptionInfo.times?.toString() || "");
    params.append("webhookUrl", subscriptionInfo.webhookUrl);
    params.append("mandateId", subscriptionInfo.mandateId);

    try {
      const response = await fetch(
        `https://api.mollie.com/v2/customers/${subscriptionInfo.customerId}/subscriptions`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${this._mollieConfiguration.mollieApiKey}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: params,
        }
      );

      const data = await response.json();
      return {
        ...data,
      };
    } catch (error) {
      throw new Error("Failed to create subscription");
    }
  }

  async getPayment(paymentId: string) {
    try {
      const response = await fetch(
        `https://api.mollie.com/v2/payments/${paymentId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${this._mollieConfiguration.mollieApiKey}`,
          },
        }
      );

      const data = await response.json();
      return {
        ...data,
      };
    } catch (error) {
      throw new Error("Failed to get payment");
    }
  }
}
