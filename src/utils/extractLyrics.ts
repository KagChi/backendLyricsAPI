import fetch from "petitio";
import cheerio from "cheerio";

/* eslint func-names: "off" */
export default async function (url: string): Promise<string | null> {
    try {
        const fetchResponse = fetch(url);
        const bodyText = await fetchResponse.text();
        const $ = cheerio.load(bodyText);
        let lyrics = $('div[class="lyrics"]').text().trim();
        if (!lyrics) {
            lyrics = "";
            $('div[class^="Lyrics__Container"]').each((i, elem) => {
                if ($(elem).text().length !== 0) {
                    const snippet = $(elem).html()?.replace(/<br>/g, "\n")
                        .replace(/<(?!\s*br\s*\/?)[^>]+>/gi, "");
                    lyrics += `${$("<textarea/>").html(snippet!).text()
                        .trim()}\n\n`;
                }
            });
        }
        if (!lyrics.length) return null;
        return lyrics.trim();
    } catch (e) {
        return null;
    }
}
