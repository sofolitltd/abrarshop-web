/**
 * bKash Payment Gateway Integration (Sandbox)
 * Documentation: https://developer.bka.sh/docs/checkout-bkash-overview
 */
// import dotenv from "dotenv";
// dotenv.config();


const BKASH_API_URL = process.env.BKASH_API_URL || "https://tokenized.sandbox.bka.sh/v1.2.0-beta/tokenized";
const BKASH_USERNAME = process.env.BKASH_USERNAME;
const BKASH_PASSWORD = process.env.BKASH_PASSWORD;
const BKASH_APP_KEY = process.env.BKASH_APP_KEY;
const BKASH_APP_SECRET = process.env.BKASH_APP_SECRET;


export interface BkashTokenResponse {
    id_token: string;
    token_type: string;
    expires_in: number;
    refresh_token: string;
}

export interface BkashCreatePaymentResponse {
    paymentID: string;
    bkashURL: string;
    callbackURL: string;
    successURL: string;
    failURL: string;
    cancelURL: string;
    amount: string;
    intent: string;
    currency: string;
    paymentCreateTime: string;
    transactionStatus: string;
    merchantInvoiceNumber: string;
    statusCode: string;
    statusMessage: string;
}

export async function getBkashToken(): Promise<string> {
    const response = await fetch(`${BKASH_API_URL}/checkout/token/grant`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            username: BKASH_USERNAME!.trim(),
            password: BKASH_PASSWORD!.trim(),
        },
        body: JSON.stringify({
            app_key: BKASH_APP_KEY?.trim(),
            app_secret: BKASH_APP_SECRET?.trim(),
        }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error("bKash token error:", errorText);
        throw new Error("Failed to grant bKash token");
    }

    const data = await response.json();
    return data.id_token;
}

export async function createBkashPayment(amount: number, invoice: string): Promise<BkashCreatePaymentResponse> {
    const token = await getBkashToken();
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const response = await fetch(`${BKASH_API_URL}/checkout/create`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            authorization: token,
            "x-app-key": BKASH_APP_KEY!.trim(),
        },
        body: JSON.stringify({
            mode: "0011",
            payerReference: "AbrarShop",
            callbackURL: `${baseUrl}/api/bkash/callback`,
            amount: amount.toString(),
            currency: "BDT",
            intent: "sale",
            merchantInvoiceNumber: invoice,
        }),
    });

    const data = await response.json();

    // Check if we have a valid response structure
    if (data && data.paymentID && data.bkashURL) {
        return data;
    }

    // Log extended error info if available, similar to reference
    console.error("bKash Create Payment Failed", data);

    // Throw error with status message if present, or generic
    throw new Error(data.statusMessage || "Failed to create bKash payment");
}

export async function executeBkashPayment(paymentID: string): Promise<any> {
    const token = await getBkashToken();

    const response = await fetch(`${BKASH_API_URL}/checkout/execute`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            authorization: token,
            "x-app-key": BKASH_APP_KEY!.trim(),
        },
        body: JSON.stringify({ paymentID }),
    });

    const data = await response.json();

    if (data && data.statusCode === "0000" && data.transactionStatus === "Completed") {
        return data;
    }

    // Log failures
    console.error("bKash Execute Payment Failed", data);
    throw new Error(data.statusMessage || "Failed to execute bKash payment");
}
