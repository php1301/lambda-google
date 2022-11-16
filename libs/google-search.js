const { load } = require("cheerio");
const axios = require("axios");
const getProxies = require("./proxies");
const getUserAgents = require("./read-user-agent");
// const axiosRetry = require('axios-retry');

// axiosRetry(axios, {
// 	retries: 3, // number of retries
// 	retryDelay: (retryCount) => {
// 		console.log(`retry attempt: ${retryCount}`);
// 		return retryCount * 2000; // time interval between retries
// 	},
// 	retryCondition: (error) => {
// 		// if retry condition is not specified, by default idempotent requests are retried
// 		return error.response.status === 503;
// 	},
// });


module.exports = async function getSearchResults(searchString) {
	try {
		// await sleep(5000);

		const proxy = await getProxies();
		const userAgents = await getUserAgents("./libs/user-agent.txt");
		const user = userAgents[Math.floor(Math.random() * userAgents?.length)];
		console.log(user, proxy);
		const AXIOS_OPTIONS = {
			headers: {
				"User-Agent": user,
				// "User-Agent":F
				//     "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.157 Safari/537.36",
			},
			Accept:
				"text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
			"Accept-Language": "en-US,en;q=0.5",
			"Accept-Encoding": "gzip, deflate",
			Connection: "keep-alive",
			"Upgrade-Insecure-Requests": "1",
			"Sec-Fetch-Dest": "document",
			"Sec-Fetch-Mode": "navigate",
			"Sec-Fetch-Site": "none",
			"Sec-Fetch-User": "?1",
			Referrer: "https://ecorp.azcc.gov/EntitySearch/Index",
			"Cache-Control": "max-age=0",
			// proxy: {
			//     host: proxy?.ip,
			//     port: parseInt(proxy?.port),
			//     protocol: "http",
			// },
		};
		const encodedString = encodeURI(searchString);
		const url = `https://www.google.com/search?q=${encodedString}&hl=en&gl=us`;
		const data = await axios.get(url, AXIOS_OPTIONS);
		const $ = load(data?.data);
		const links = [];
		const ads = [];
		// const titles: any = [];
		// const snippets: any = [];
		let totalResults = "";
		let searchTime = "";
		let htmlCode = "";
		$(".yuRUbf > a").each((i, el) => {
			links[i] = $(el).attr("href");
		});

		$(".d8lRkd").each((i, el) => {
			ads[i] = $(el).text().trim();
		});
		// $(".yuRUbf > a > h3").each((i, el) => {
		//     titles[i] = $(el).text();
		// });
		// $(".IsZvec").each((i, el) => {
		//     snippets[i] = $(el).text().trim();
		// });
		htmlCode = $("#rcnt").html() || "";
		const htmlLink = await axios.post("https://jsonblob.com/api/jsonBlob", {
			htmlCode,
		});
		totalResults = $("#result-stats").text().trim().split(" ")[1];
		searchTime = $("#result-stats > nobr").text().trim().slice(1, -1);
		const result = [];
		for (let i = 0; i < links.length; i++) {
			result[i] = {
				link: links[i],
				// title: titles[i],
				// snippet: snippets[i],
			};
		}
		return {
			keyword: searchString,
			htmlLink: htmlLink?.headers["location"],
			totalResults: totalResults,
			totalAds: ads?.length || "2",
			searchTime: searchTime || "0.2s",
			links,
			totalLinks: links?.length || "1",
			searchedLink: url,
		};
	} catch (e) {
		throw Error(e?.message);
	}
};
