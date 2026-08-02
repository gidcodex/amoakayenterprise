const KHAYA_URL = process.env.KHAYA_TRANSLATION_URL;
const KHAYA_API_KEY = process.env.KHAYA_API_KEY;

export async function translateText(text, from = "eng", to = "twi") {
  try {
    const response = await fetch(KHAYA_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Ocp-Apim-Subscription-Key": KHAYA_API_KEY,
      },
      body: JSON.stringify({
        in: text,
        lang: `${from}-${to}`,
      }),
      cache: "no-store",
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error);
    }

    const translatedText = await response.json();

    return translatedText;
  } catch (error) {
    console.error("Khaya Translation Error:", error);
    throw error;
  }
}