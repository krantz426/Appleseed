interface TremendousOrderResponse {
  order: {
    id: string;
    status: string;
    rewards: Array<{
      id: string;
      delivery: {
        status: string;
        link?: string;
      };
    }>;
  };
}

interface TremendousErrorResponse {
  errors?: Record<string, string[]>;
  message?: string;
}

function getApiKey(): string {
  const key = process.env.TREMENDOUS_API_KEY;
  if (!key) {
    throw new Error(
      "Missing TREMENDOUS_API_KEY environment variable. " +
        "Add it to your .env.local file."
    );
  }
  return key;
}

function getCampaignId(): string {
  const id = process.env.TREMENDOUS_CAMPAIGN_ID;
  if (!id) {
    throw new Error(
      "Missing TREMENDOUS_CAMPAIGN_ID environment variable. " +
        "Add it to your .env.local file."
    );
  }
  return id;
}

function getBaseUrl(): string {
  // Use sandbox in development, production API otherwise
  return process.env.TREMENDOUS_API_URL || "https://www.tremendousapi.com/api/v2";
}

const MAX_RETRIES = 3;
const BASE_DELAY_MS = 500;

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Tremendous API client for purchasing gift cards.
 */
export class TremendousClient {
  private apiKey: string;
  private campaignId: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = getApiKey();
    this.campaignId = getCampaignId();
    this.baseUrl = getBaseUrl();
  }

  /**
   * Purchase a gift card through the Tremendous API.
   *
   * @param amountDollars - Gift card value in dollars (e.g. 50.00)
   * @param brand - The brand/product ID for the gift card (e.g. "amazon")
   * @param recipientEmail - Optional email to deliver the gift card to
   * @returns The order response from Tremendous
   */
  async purchaseGiftCard(
    amountDollars: number,
    brand: string,
    recipientEmail?: string
  ): Promise<TremendousOrderResponse> {
    const payload = {
      payment: {
        funding_source_id: "balance",
      },
      rewards: [
        {
          value: {
            denomination: amountDollars,
            currency_code: "USD",
          },
          products: [brand],
          campaign_id: this.campaignId,
          delivery: {
            method: recipientEmail ? "EMAIL" : "LINK",
            ...(recipientEmail && {
              meta: {
                email: recipientEmail,
              },
            }),
          },
        },
      ],
    };

    return this.postWithRetry("/orders", payload);
  }

  private async postWithRetry<T>(
    path: string,
    body: unknown,
    attempt = 1
  ): Promise<T> {
    const url = `${this.baseUrl}${path}`;

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        return (await response.json()) as T;
      }

      // Parse error response
      let errorBody: TremendousErrorResponse = {};
      try {
        errorBody = (await response.json()) as TremendousErrorResponse;
      } catch {
        // Could not parse error body
      }

      // Retry on 429 (rate limit) and 5xx (server errors)
      const isRetryable = response.status === 429 || response.status >= 500;
      if (isRetryable && attempt < MAX_RETRIES) {
        const delayMs = BASE_DELAY_MS * Math.pow(2, attempt - 1);
        await sleep(delayMs);
        return this.postWithRetry<T>(path, body, attempt + 1);
      }

      const errorMessage =
        errorBody.message ||
        JSON.stringify(errorBody.errors) ||
        `HTTP ${response.status}`;
      throw new Error(
        `Tremendous API error (${response.status}): ${errorMessage}`
      );
    } catch (error) {
      // Retry on network errors
      if (
        error instanceof TypeError &&
        error.message.includes("fetch") &&
        attempt < MAX_RETRIES
      ) {
        const delayMs = BASE_DELAY_MS * Math.pow(2, attempt - 1);
        await sleep(delayMs);
        return this.postWithRetry<T>(path, body, attempt + 1);
      }
      throw error;
    }
  }
}

/** Lazy singleton — avoids reading env vars at import time */
let _instance: TremendousClient | null = null;
export const tremendous = new Proxy({} as TremendousClient, {
  get(_target, prop) {
    if (!_instance) _instance = new TremendousClient();
    return (_instance as unknown as Record<string | symbol, unknown>)[prop];
  },
});
