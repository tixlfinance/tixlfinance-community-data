import axios from "axios";
import cheerio from "cheerio";

async function main() {
    try {
        const response = await axios.get(
            "https://wallet.tether.to/transparency"
        );
        //console.log(response.data);
        const $ = cheerio.load(response.data);

        const data = $(".ccy-header")
            .map((i, el) => {
                return {
                    id: $(el).text(),
                    total_assets: $(el)
                        .siblings("table")
                        .find('th:contains("Total Assets")')
                        .siblings("td:first")
                        .text(),
                };
            })
            .toArray();

        return data[0]["total_assets"];
    } catch (error) {
        console.error(error);
    }
}

main();
