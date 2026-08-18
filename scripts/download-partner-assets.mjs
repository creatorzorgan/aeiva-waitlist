import { mkdir, writeFile } from "node:fs/promises";

const outputDirectory = new URL("../assets/partner-logos/", import.meta.url);
await mkdir(outputDirectory, { recursive: true });

const assets = [
  ["demonstrator-lab.svg", "https://demonstratorlab.nl/front/images/logo.svg"],
  [
    "startup-village.webp",
    "https://images.squarespace-cdn.com/content/v1/60701561519ce6103b1c7c2d/1621334853384-TW5FXM1ZYRHUABVGNU8D/startupvillage_logo_black%404x.png?format=1500w",
  ],
  [
    "google-for-startups.jpg",
    "https://storage.googleapis.com/gweb-cloudblog-publish/images/startups_gpxYjQP.max-2500x2500.jpg",
  ],
  [
    "attio.svg",
    "https://a.storyblok.com/f/234930/18x18/cfb7753a31/attio.svg",
  ],
  [
    "cloudflare.svg",
    "https://cf-assets.www.cloudflare.com/slt3lc6tev37/1wf4qdGsPqa2UUSEoa4Yyg/3250a65f210bbb7062ab4dd9a9bdf213/logo-cloudflare-dark.svg",
  ],
  [
    "flag-netherlands.svg",
    "https://upload.wikimedia.org/wikipedia/commons/2/20/Flag_of_the_Netherlands.svg",
  ],
  [
    "flag-india.svg",
    "https://upload.wikimedia.org/wikipedia/commons/4/41/Flag_of_India.svg",
  ],
];

for (const [filename, url] of assets) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}: ${url}`);
  }
  const bytes = new Uint8Array(await response.arrayBuffer());
  await writeFile(new URL(filename, outputDirectory), bytes);
  console.log(`${filename}: ${bytes.byteLength} bytes`);
}
