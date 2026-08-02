import { translateText } from "./khaya";

const languageMap = {
  tw: "twi",
  ee: "ewe",
  gaa: "gaa",
};

export async function translateLanguages(text) {
  const result = {};

  for (const [siteLang, khayaLang] of Object.entries(languageMap)) {
    try {
      result[siteLang] = await translateText(
        text,
        "eng",
        khayaLang
      );
    } catch (error) {
      console.error(`Translation failed for ${siteLang}`, error);
      result[siteLang] = text;
    }
  }

  return result;
}