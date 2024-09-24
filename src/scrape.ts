import { PlaywrightCrawler } from "crawlee";
import * as cheerio from "cheerio";
import { Job, CompanyData, News, Founder, Company } from "./interface.js";

// To scrape company page given url.
export async function scrapeCompanyPage(companies: Company[]): Promise<{}> {
  const urls = companies.map((company) => company.url);
  const names = companies.map((company) => company.name);

  return new Promise(async (resolve, reject) => {
    const result = [] as CompanyData[];
    const crawler = new PlaywrightCrawler({
      async requestHandler({ page, request }) {
        try {
          await page.waitForSelector(".mx-auto.max-w-ycdc-page"); // Adjust the selector as needed

          const content = await page.content();
          const object = extractData(content) as CompanyData;

          result.push({
            ...{ name: names[urls.indexOf(request.url)] },
            ...object,
          });
        } catch (error) {
          console.log(`Failed to scrape ${request.url}: ${error}`);
        }
      },
    });

    // Run the crawl for all the given urls
    await crawler.run(urls);

    // sort the array in provided order
    result.sort((a, b) => {
      return names.indexOf(a.name!) - names.indexOf(b.name!);
    });
    // result.filter(item => names.includes(filter))

    resolve(result);
  });
}

const extractData = (content: string) => {
  const $ = cheerio.load(content);

  //   const name = $("h1.font-extralight").text();
  const brief = $("div.space-y-3 .text-xl").text();
  const description = $(".border-retro-sectionBorder .whitespace-pre-line")
    .first()
    .text();
  const foundindInfo = $(".space-y-0\\.5 span").toArray();
  let founded = "";
  let teamSize = "";

  foundindInfo.forEach((item, ind) => {
    if ($(item).text() == "Founded:") founded = $(foundindInfo[ind + 1]).text();
    else if ($(item).text() == "Team Size:")
      teamSize = $(foundindInfo[ind + 1]).text();
  });

  // founders logic
  let foundersList = $(".space-y-5 > *").toArray();
  if (foundersList.length === 0)
    foundersList = $(".shrink-0.space-y-1\\.5").toArray();

  const founders = [] as Founder[];

  foundersList.forEach((item) => {
    let founder = {} as Founder;
    founder.name = $(item).find(".leading-snug > .font-bold").text();
    founder.about = $(item).find("p").text();
    const socials = $(item).find("a").toArray();
    founder.linkedIn = $(
      socials.filter((socialItem) =>
        $(socialItem).attr("href")?.includes("linkedin")
      )
    ).attr("href");
    founders.push(founder);
  });

  // jobs logic
  const jobsSelector = $("section > .flex.w-full.flex-col > *").toArray();
  const jobs = [] as Job[];

  jobsSelector.forEach((item, index) => {
    const job = {} as Job;
    job.role = $(item).find(".font-bold a").text();
    job.url = $(item).find(".font-bold a").attr("href");
    const details = $(item).find(".justify-left.flex > *").toArray();
    details.forEach((detailsItem, index) => {
      let text = $(detailsItem).text();
      if (index == 0) job.locations = text;
      else if (text.includes("$")) job.pay = text;
      else if (
        text.toLowerCase().includes("years") ||
        text.toLowerCase().includes("any")
      )
        job.exp = text;
    });
    jobs.push(job);
  });

  // news logic
  const newsArray = $("#news > *").last().children().toArray();
  const news = [] as News[];

  newsArray.forEach((item) => {
    const newsObject = {} as News;
    newsObject.title = $(item).first().text();
    newsObject.url = $(item).first().find("a").attr("href");
    newsObject.timeline = $(item).last().text();
    news.push(newsObject);
  });

  return {
    brief: brief,
    description: description,
    founded: founded,
    teamSize: teamSize,
    founders: founders,
    jobs: jobs,
    latestNews: news,
  }; // return CompanyData object
};
