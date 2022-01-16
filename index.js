const axios = require('axios')
const fs = require('fs')
const cheerio = require('cheerio')

async function getData() {

    try {
        const baseUrl = "https://www.accuweather.com"
        const urlMonth = "https://www.accuweather.com/en/gb/london/ec4a-2/august-weather/328328"
        const urlDay = "https://www.accuweather.com/en/gb/london/ec4a-2/daily-weather-forecast/328328"
        const res = await Promise.all([
            axios({
                method: "GET",
                url: urlMonth
            }),
            axios({
                method: "GET",
                url: urlDay
            })
        ])


        const data = await convertToObjectFirstPage(res[0].data)
        // const page2 = await getSecondPage(res[0].data, baseUrl)
        const page2data = await getSecondPage(res[0].data, baseUrl)
        const test = await convertToObject2ndPage(page2data)


        fs.writeFile('output.json', JSON.stringify(data, null, 4), function (err) {
            console.log('File successfully written! - Check your project directory for the output.json file');
        })
    } catch (e) {
        console.log(e);
    }


}
async function convertToObject2ndPage(data) {
    //console.log("data",data);
    const $ = cheerio.load(data)
    const info = {}
    $('div.content-module').remove('.more-cta-links')
    // $.html()
    // console.log($('div.content-module .more-cta-links').text().trim());
    $('div.content-module > div.daily-wrapper').each((i, elem) => {
        test($(elem).children().html())


    })
    function test(params) {
        const $ = cheerio.load(params)
        console.log($('div.info').text().replace(/\s/g, "").split("/"));
        let [date, high, low] = $('div.info').text().replace(/\s/g, "").split("/")

        console.log(date, high, low);

    }
}
async function getSecondPage(data, baseUrl) {
    const $ = cheerio.load(data)
    const pageHref = $('div.monthly-cta a.monthly-cta').attr("href")
    const res = await axios({
        method: "GET",
        url: baseUrl + pageHref
    })
    // console.log(res.status);
    return res.data
    // $('div.monthly-cta .a.monthly-cta').each((i, elem) => {
    // "body > div > div.two-column-page-content > div.page-column-1 > div.content-module > div.monthly-tools.non-ad > div.monthly-cta > a"
    // })
}
async function convertToObjectFirstPage(data) {
    const $ = cheerio.load(data)

    let days
    const all = []
    $('.monthly-header').each((i, elem) => {
        days = $(elem).children().text().replace(/\s/g, "").split("")

    })


    $('.monthly-daypanel').each((i, elem) => {
        const value = $(elem).children().text().replace(/\s/g, "").replace("Hist.Avg", "").split(".")
        const degree = value[1].split("°")
        all.push({ 'date': value[0], 'high': degree[0], 'low': degree[1] })

    });

    let j = 0
    for (let i = 0; i < all.length; i++) {
        const item = all[i];
        if (j >= 7) j = 0
        if (days[i] == undefined) {
            item["weekday"] = days[j]
            j++
        } else {
            item["weekday"] = days[i]
        }


    }

    return all
}


getData()