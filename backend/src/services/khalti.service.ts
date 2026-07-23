import https from "https";
import { URL } from "url";
import { IOrder } from "../models/order.model";
import { HttpError } from "../errors/http-error";
import {
  KHALTI_SECRET_KEY,
  KHALTI_RETURN_URL,
  KHALTI_WEBSITE_URL,
} from "../config";

interface KhaltiInitiateResponse {
  pidx: string;
  payment_url: string;
  expires_at?: string;
}

interface KhaltiLookupResponse {
  status: string;
  transaction_id?: string;
  purchase_order_id?: string;
}

const KHALTI_BASE_URL = "https://a.khalti.com/api/v2/epayment";

const khaltiRequest = async <T>(path: string, payload: Record<string, unknown>) => {
  if (!KHALTI_SECRET_KEY) {
    throw new HttpError(500, "Khalti secret key is not configured");
  }

  return new Promise<T>((resolve, reject) => {
    const url = new URL(`${KHALTI_BASE_URL}${path}`);
    const requestBody = JSON.stringify(payload);

    const req = https.request(
      url,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(requestBody),
          Authorization: `Key ${KHALTI_SECRET_KEY}`,
        },
      },
      (res) => {
        let data = "";

        res.on("data", (chunk) => {
          data += chunk.toString();
        });

        res.on("end", () => {
          try {
            const parsed = data ? (JSON.parse(data) as T) : ({} as T);
            const statusCode = res.statusCode ?? 500;

            if (statusCode >= 400) {
              const message =
                typeof parsed === "object" && parsed && "detail" in parsed
                  ? (parsed as any).detail
                  : "Khalti request failed";
              return reject(new HttpError(statusCode, message));
            }

            resolve(parsed);
          } catch (error) {
            reject(new HttpError(500, "Failed to parse Khalti response"));
          }
        });
      }
    );

    req.on("error", () => {
      reject(new HttpError(500, "Khalti request failed"));
    });

    req.write(requestBody);
    req.end();
  });
};

export class KhaltiService {
  async initiatePayment(order: IOrder): Promise<KhaltiInitiateResponse> {
    if (!KHALTI_RETURN_URL) {
      throw new HttpError(500, "Khalti return URL is not configured");
    }

    const returnUrl = new URL(KHALTI_RETURN_URL);
    returnUrl.searchParams.set("orderId", order._id.toString());

    const amount = Math.round(order.total * 100);

    const payload = {
      return_url: returnUrl.toString(),
      website_url: KHALTI_WEBSITE_URL,
      amount,
      purchase_order_id: order._id.toString(),
      purchase_order_name: `Order-${order._id.toString().slice(-8)}`,
      customer_info: {
        name: order.customerName,
        email: order.customerEmail,
        phone: order.phone,
      },
    };

    return khaltiRequest<KhaltiInitiateResponse>("/initiate/", payload);
  }

  async lookupPayment(pidx: string): Promise<KhaltiLookupResponse> {
    const payload = { pidx };
    return khaltiRequest<KhaltiLookupResponse>("/lookup/", payload);
  }
}
