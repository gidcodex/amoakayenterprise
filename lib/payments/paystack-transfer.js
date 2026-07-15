const PAYSTACK_BASE_URL = "https://api.paystack.co";

function getPaystackSecretKey() {
  const secretKey = process.env.PAYSTACK_SECRET_KEY;

  if (!secretKey) {
    throw new Error(
      "PAYSTACK_SECRET_KEY is missing from the environment variables."
    );
  }

  return secretKey;
}

async function paystackTransferRequest(path, options = {}) {
  const response = await fetch(`${PAYSTACK_BASE_URL}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${getPaystackSecretKey()}`,
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    cache: "no-store",
  });

  let data;

  try {
    data = await response.json();
  } catch {
    throw new Error(
      "Paystack returned an invalid response."
    );
  }

  if (!response.ok || data?.status !== true) {
    throw new Error(
      data?.message ||
        `Paystack transfer request failed with status ${response.status}.`
    );
  }

  return data;
}

export async function createPaystackMobileMoneyRecipient({
  accountName,
  phone,
  network,
  description,
}) {
  if (!accountName?.trim()) {
    throw new Error(
      "The seller payout account name is required."
    );
  }

  if (!phone?.trim()) {
    throw new Error(
      "The seller Mobile Money number is required."
    );
  }

  const bankCode = getPaystackMobileMoneyBankCode(network);

  return paystackTransferRequest("/transferrecipient", {
    method: "POST",
    body: JSON.stringify({
      type: "mobile_money",
      name: accountName.trim(),
      account_number: normalizeGhanaPhone(phone),
      bank_code: bankCode,
      currency: "GHS",
      description:
        description ||
        "Amoakay Deals seller payout recipient",
    }),
  });
}

export async function createPaystackBankRecipient({
  accountName,
  accountNumber,
  bankCode,
  description,
}) {
  if (!accountName?.trim()) {
    throw new Error(
      "The seller bank account name is required."
    );
  }

  if (!accountNumber?.trim()) {
    throw new Error(
      "The seller bank account number is required."
    );
  }

  if (!bankCode?.trim()) {
    throw new Error(
      "The Paystack bank code is required."
    );
  }

  return paystackTransferRequest("/transferrecipient", {
    method: "POST",
    body: JSON.stringify({
      type: "ghipss",
      name: accountName.trim(),
      account_number: accountNumber.trim(),
      bank_code: bankCode.trim(),
      currency: "GHS",
      description:
        description ||
        "Amoakay Deals seller bank payout recipient",
    }),
  });
}

export async function initiatePaystackTransfer({
  amount,
  recipientCode,
  reference,
  reason,
}) {
  if (!Number.isInteger(amount) || amount <= 0) {
    throw new Error(
      "Transfer amount must be a positive integer in pesewas."
    );
  }

  if (!recipientCode?.trim()) {
    throw new Error(
      "Paystack recipient code is required."
    );
  }

  if (!reference?.trim()) {
    throw new Error(
      "A unique transfer reference is required."
    );
  }

  return paystackTransferRequest("/transfer", {
    method: "POST",
    body: JSON.stringify({
      source: "balance",
      amount,
      recipient: recipientCode.trim(),
      reference: reference.trim(),
      reason:
        reason ||
        "Amoakay Deals seller payout",
      currency: "GHS",
    }),
  });
}

function getPaystackMobileMoneyBankCode(network) {
  const codes = {
    MTN: "MTN",
    TELECEL: "VOD",
    AIRTELTIGO: "ATL",
  };

  const code = codes[String(network || "").toUpperCase()];

  if (!code) {
    throw new Error(
      "The seller has an unsupported Mobile Money network."
    );
  }

  return code;
}

function normalizeGhanaPhone(phone) {
  const digits = String(phone).replace(/\D/g, "");

  if (digits.startsWith("233") && digits.length === 12) {
    return `0${digits.slice(3)}`;
  }

  if (digits.length === 10 && digits.startsWith("0")) {
    return digits;
  }

  throw new Error(
    "Enter a valid Ghanaian phone number, for example 0241234567."
  );
}