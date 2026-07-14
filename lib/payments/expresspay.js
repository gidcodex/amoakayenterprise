const EXPRESSPAY_SANDBOX_BASE_URL =
  "https://sandbox.expresspaygh.com";

const EXPRESSPAY_LIVE_BASE_URL =
  "https://expresspaygh.com";

function getExpressPayBaseUrl() {
  return process.env.EXPRESSPAY_ENVIRONMENT === "live"
    ? EXPRESSPAY_LIVE_BASE_URL
    : EXPRESSPAY_SANDBOX_BASE_URL;
}

function getExpressPayCredentials() {
  const merchantId = process.env.EXPRESSPAY_MERCHANT_ID;
  const apiKey = process.env.EXPRESSPAY_API_KEY;

  if (!merchantId || !apiKey) {
    throw new Error(
      "ExpressPay credentials are missing. Add EXPRESSPAY_MERCHANT_ID and EXPRESSPAY_API_KEY to your environment variables."
    );
  }

  return {
    merchantId,
    apiKey,
  };
}

function createFormBody(values) {
  const form = new URLSearchParams();

  Object.entries(values).forEach(([key, value]) => {
    if (
      value !== undefined &&
      value !== null &&
      String(value).trim() !== ""
    ) {
      form.append(key, String(value));
    }
  });

  return form;
}

function parseExpressPayResponse(text) {
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(
      `ExpressPay returned an invalid response: ${text || "Empty response"}`
    );
  }
}

/*
|--------------------------------------------------------------------------
| SUBMIT PAYMENT
|--------------------------------------------------------------------------
|
| Creates a payment session and returns the ExpressPay token.
|
*/
export async function submitExpressPayPayment({
  firstName,
  lastName,
  email,
  phoneNumber,
  username,
  accountNumber,
  amount,
  orderId,
  orderDescription,
  orderImageUrl,
  redirectUrl,
  postUrl,
}) {
  const { merchantId, apiKey } =
    getExpressPayCredentials();

  const baseUrl = getExpressPayBaseUrl();

  const formBody = createFormBody({
    "merchant-id": merchantId,
    "api-key": apiKey,
    firstname: firstName,
    lastname: lastName,
    email,
    phonenumber: phoneNumber,
    username: username || email,
    accountnumber: accountNumber,
    currency: "GHS",
    amount: Number(amount).toFixed(2),
    "order-id": orderId,
    "order-desc": orderDescription,
    "order-img-url": orderImageUrl,
    "redirect-url": redirectUrl,
    "post-url": postUrl,
  });

  const response = await fetch(
    `${baseUrl}/api/submit.php`,
    {
      method: "POST",
      headers: {
        "Content-Type":
          "application/x-www-form-urlencoded",
      },
      body: formBody,
      cache: "no-store",
    }
  );

  const responseText = await response.text();
  const data = parseExpressPayResponse(responseText);

  if (!response.ok) {
    throw new Error(
      data?.message ||
        "ExpressPay submit request failed."
    );
  }

  if (Number(data.status) !== 1 || !data.token) {
    throw new Error(
      data?.message ||
        getSubmitErrorMessage(data?.status)
    );
  }

  return {
    token: data.token,
    orderId: data["order-id"] || orderId,
    checkoutUrl: `${baseUrl}/payment?token=${encodeURIComponent(
      data.token
    )}`,
    rawResponse: data,
  };
}

/*
|--------------------------------------------------------------------------
| QUERY PAYMENT
|--------------------------------------------------------------------------
|
| ExpressPay requires the merchant to query the transaction token before
| marking an order as paid.
|
*/
export async function queryExpressPayPayment(token) {
  if (!token) {
    throw new Error(
      "ExpressPay payment token is required."
    );
  }

  const { merchantId, apiKey } =
    getExpressPayCredentials();

  const baseUrl = getExpressPayBaseUrl();

  const formBody = createFormBody({
    "merchant-id": merchantId,
    "api-key": apiKey,
    token,
  });

  const response = await fetch(
    `${baseUrl}/api/query.php`,
    {
      method: "POST",
      headers: {
        "Content-Type":
          "application/x-www-form-urlencoded",
      },
      body: formBody,
      cache: "no-store",
    }
  );

  const responseText = await response.text();
  const data = parseExpressPayResponse(responseText);

  if (!response.ok) {
    throw new Error(
      data?.["result-text"] ||
        "ExpressPay query request failed."
    );
  }

  const result = Number(data.result);

  return {
    result,
    status: mapExpressPayResultToPaymentStatus(
      result
    ),
    approved: result === 1,
    pending: result === 4,
    declined: result === 2,
    error: result === 3,

    orderId: data["order-id"] || null,
    token: data.token || token,

    transactionId:
      data["transaction-id"] ||
      data.transaction_id ||
      null,

    amount:
      data.amount !== undefined
        ? Number(data.amount)
        : null,

    currency: data.currency || "GHS",

    resultText:
      data["result-text"] || "Unknown response",

    processedAt:
      data["date-processed"] || null,

    rawResponse: data,
  };
}

/*
|--------------------------------------------------------------------------
| HELPERS
|--------------------------------------------------------------------------
*/

export function mapExpressPayResultToPaymentStatus(
  result
) {
  switch (Number(result)) {
    case 1:
      return "SUCCESSFUL";

    case 2:
      return "FAILED";

    case 4:
      return "PROCESSING";

    case 3:
    default:
      return "FAILED";
  }
}

function getSubmitErrorMessage(status) {
  switch (Number(status)) {
    case 2:
      return "ExpressPay rejected the merchant credentials.";

    case 3:
      return "ExpressPay rejected the payment request.";

    case 4:
      return "ExpressPay rejected the request because the server IP is not allowed.";

    default:
      return "ExpressPay could not create the payment session.";
  }
}