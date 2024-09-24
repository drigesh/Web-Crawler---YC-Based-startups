import { fileURLToPath } from "url";
import { promises as fs } from "fs";
import path from "path";
import Papa from "papaparse";
import { scrapeCompanyPage } from "./scrape.js";
import { Company } from "./interface.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const outFilePath = path.resolve(__dirname, "../out/scraped.json");

export async function parseCSV(filePath: string): Promise<Company[]> {
  const fileContent = await fs.readFile(filePath, "utf-8");
  return new Promise((resolve, reject) => {
    Papa.parse<Company>(fileContent, {
      header: true,
      transformHeader: (header: string) => {
        if (header === "Company Name") return "name";
        if (header === "YC URL") return "url";
        return header;
      },
      complete: (result) => {
        resolve(result.data);
      },
      error: (error: unknown) => reject(error),
    });
  });
}

export async function processCompanyList() {
  const csvPath = path.resolve(__dirname, "../inputs/companies.csv");

  const companies = (await parseCSV(csvPath).catch((e) => {
    console.log(e);
  })) as Company[];

  await scrapeCompanyPage(companies)
    .then((response) => {
      writeToFile(JSON.stringify(response, null, 2));
    })
    .catch((e) => {
      console.log(e);
    });
}

const writeToFile = async (content: string) => {
  try {
    const dir = path.dirname(outFilePath);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(outFilePath, content, "utf8");
    console.log(`File successfully written to ${outFilePath}`);
  } catch (error) {
    console.error("Error writing to file:", error);
  }
};
