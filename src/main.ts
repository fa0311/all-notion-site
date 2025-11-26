import { DOMParser } from "@xmldom/xmldom";
import fs from "node:fs/promises";
import { z } from "zod";

const baseUrl = new URL("https://sitemaps.notion.site");

const SitemapUrlEntrySchema = z.object({
	loc: z.url(),
	lastmod: z.string().regex(/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/),
});

const parseSitemap = (xml: string): z.infer<typeof SitemapUrlEntrySchema>[] => {
	const parser = new DOMParser();
	const doc = parser.parseFromString(xml, "application/xml");

	const parserError = doc.getElementsByTagName("parsererror")[0];
	if (parserError) {
		throw new Error("Failed to parse sitemap XML");
	}

	return Array.from(doc.getElementsByTagName("url")).map((node) => {
		const loc = node.getElementsByTagName("loc")[0]!.textContent!;
		const lastmod = node.getElementsByTagName("lastmod")[0]!.textContent;
		return SitemapUrlEntrySchema.parse({ loc, lastmod });
	});
};

const countEach = async <T>(callback: (i: number) => Promise<[boolean, T]>): Promise<T[]> => {
	let i = 0;
	const results: T[] = [];
	while (true) {
		const [hasMore, items] = await callback(i);
		results.push(items);
		if (!hasMore) {
			break;
		}
		i++;
	}
	return results;
};

const chunk = <T>(array: T[], size: number): T[][] => {
	const result: T[][] = [];
	for (let i = 0; i < array.length; i += size) {
		result.push(array.slice(i, i + size));
	}
	return result;
};

fs.mkdir("output/raw", { recursive: true });
fs.mkdir("output/all", { recursive: true });
fs.mkdir("output/chunks", { recursive: true });

const res = await countEach(async (i) => {
	const res = await fetch(new URL(`notion-site-sitemap-${i}.xml`, baseUrl));
	if (res.ok) {
		const text = await res.text();
		const entries = parseSitemap(text);
		console.log(`Sitemap ${i} has ${entries.length} entries.`);
		await fs.writeFile(`output/raw/notion-site-sitemap-${i}.xml`, text);
		return [true, entries];
	} else {
		console.warn(`Sitemap ${i} not found.`);
		return [false, []];
	}
});

const allEntries = res.flat();
console.log(`Total entries collected: ${allEntries.length}`);
await fs.writeFile("output/all/notion-site-sitemap.json", JSON.stringify(allEntries));
await Promise.all(
	chunk(allEntries, 1000).map(async (entry, i) => {
		await fs.writeFile(`output/chunks/notion-site-sitemap-${i}.json`, JSON.stringify(entry, null, 2));
	}),
);
