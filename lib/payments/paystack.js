const PAYSTACK_BASE_URL = "https://api.paystack.co";

function getSecretKey() {
  const secretKey = process.env.PAYSTACK_SECRET_KEY;

  if (!secretKey) {
    throw new Error(
      "PAYSTACK_SECRET_KEY is missing from the environment variables."
    );
  }

  return secretKey;
}

async function paystackRequest(path, options = {}) {
  const response = await fetch(`${PAYSTACK_BASE_URL}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${getSecretKey()}`,
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    cache: "no-store",
  });

  let data;

  try {
    data = await response.json();
  } catch {
    throw new Error("Paystack returned an invalid JSON response.");
  }

  if (!response.ok || data?.status !== true) {
    throw new Error(
      data?.message || `Paystack request failed with status ${response.status}.`
    );
  }

  return data;
}

export async function initializePaystackTransaction({
  email,
  amount,
  reference,
  callbackUrl,
  metadata = {},
}) {
  if (!email) {
    throw new Error("Customer email is required.");
  }

  if (!Number.isInteger(amount) || amount <= 0) {
    throw new Error(
      "Amount must be a positive integer in pesewas."
    );
  }

  if (!reference) {
    throw new Error("Transaction reference is required.");
  }

  if (!callbackUrl) {
    throw new Error("Callback URL is required.");
  }

  return paystackRequest("/transaction/initialize", {
    method: "POST",
    body: JSON.stringify({
      email,
      amount,
      reference,
      currency: "GHS",
      callback_url: callbackUrl,
      channels: ["mobile_money", "card"],
      metadata,
    }),
  });
}

export async function verifyPaystackTransaction(reference) {
  if (!reference) {
    throw new Error("Transaction reference is required.");
  }

  return paystackRequest(
    `/transaction/verify/${encodeURIComponent(reference)}`,
    {
      method: "GET",
    }
  );
}