import fs from "node:fs";
import path from "node:path";

import { siSamsung, siApple, siGoogle, siXiaomi, siOneplus, siLenovo, siHp, siDell, siSony, siAsus,} from "simple-icons";

const outputDirectory = path.join(
  process.cwd(),
  "public",
  "brands"
);

const brands = [
  {
    filename: "samsung.svg",
    icon: siSamsung,
    color: "#1428A0",
  },
  {
    filename: "apple.svg",
    icon: siApple,
    color: "#000000",
  },
  {
    filename: "google.svg",
    icon: siGoogle,
    color: "#4285F4",
  },
  {
    filename: "xiaomi.svg",
    icon: siXiaomi,
    color: "#FF6900",
  },
  {
    filename: "oneplus.svg",
    icon: siOneplus,
    color: "#F5010C",
  },
  {
    filename: "lenovo.svg",
    icon: siLenovo,
    color: "#E2231A",
  },
  {
    filename: "hp.svg",
    icon: siHp,
    color: "#0096D6",
  },
  {
    filename: "dell.svg",
    icon: siDell,
    color: "#007DB8",
  },
  {
    filename: "sony.svg",
    icon: siSony,
    color: "#000000",
  },
  {
    filename: "asus.svg",
    icon: siAsus,
    color: "#00539B",
  },
];

fs.mkdirSync(outputDirectory, {
  recursive: true,
});

for (const brand of brands) {
  const svg = `
<svg
  role="img"
  aria-label="${brand.icon.title}"
  viewBox="0 0 24 24"
  xmlns="http://www.w3.org/2000/svg"
>
  <title>${brand.icon.title}</title>
  <path
    fill="${brand.color}"
    d="${brand.icon.path}"
  />
</svg>
`.trim();

  const outputPath = path.join(
    outputDirectory,
    brand.filename
  );

  fs.writeFileSync(outputPath, svg, "utf8");

  console.log(`Created: ${outputPath}`);
}

console.log("All brand logos were generated successfully.");