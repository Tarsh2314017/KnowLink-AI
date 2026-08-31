import axios from "axios";
import * as cheerio from "cheerio";
import { JSDOM } from "jsdom";
import { Readability } from "@mozilla/readability";

interface ExtractedContent {
  title: string;
  content: string;
}

export const extractWebContent = async (
  url: string
): Promise<ExtractedContent> => {
  const response = await axios.get<string>(url, {
    timeout: 15000,

    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/131.0 Safari/537.36",
      Accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    },

    maxContentLength: 5 * 1024 * 1024,
    maxBodyLength: 5 * 1024 * 1024,
  });

  const html = response.data;

  const $ = cheerio.load(html);

  $("script, style, noscript, iframe").remove();

  const fallbackTitle =
    $("title").first().text().trim() || "Untitled Source";

  const dom = new JSDOM(html, {
    url,
  });

  const reader = new Readability(dom.window.document);

  const article = reader.parse();

  dom.window.close();

  if (!article || !article.textContent?.trim()) {
    const fallbackContent = $("body").text().replace(/\s+/g, " ").trim();

    if (!fallbackContent) {
      throw new Error("Unable to extract readable content from this URL");
    }

    return {
      title: fallbackTitle,
      content: fallbackContent,
    };
  }

  return {
    title: article.title?.trim() || fallbackTitle,
    content: article.textContent.replace(/\s+/g, " ").trim(),
  };
};