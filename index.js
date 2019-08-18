const cheerio = require('cheerio')
// const { execSync } = require('child_process');

const util = require('util');
const exec = util.promisify(require('child_process').exec);

const maxBuffer = { maxBuffer: 1024 * 500 };

const getGoldPrice = async () => {
    const { stdout, stderr } = await exec('curl https://kurse.boerse.ard.de/ard/kurse_einzelkurs_uebersicht.htn?i=2323869', maxBuffer);
    const $ = cheerio.load(stdout);
    const currentGp = $('#vwd_content > div:nth-child(5) > div > span.leftfloat.big').text()
    return parseFloat(currentGp.replace('.', '').replace(',', '.'));
}

const getSilverPrice = async () => {
    const { stdout, stderr } = await exec('curl https://www.apmex.com/spotprices/silver-prices', maxBuffer);
    const $ = cheerio.load(stdout);
    const currentSp = $('body > main > div > div > div.spotprice-header > div > div > div.ny-spot-price > div.spotprice-content-block > table > tbody > tr:nth-child(1) > td.text-right > span').text()
    return parseFloat(currentSp.replace('$',''));
}

const getCurrentRatio = async () => {
    const { stdout, stderr } = await exec('curl https://www.bullionbypost.co.uk/price-ratio/gold-silver-ratio-chart/', maxBuffer);
    const $ = cheerio.load(stdout);
    const currentRatio = $('#show-ratio-chart > div:nth-child(3) > div.col-lg-4.col-md-5.col-sm-12.ratio-table-column > div > table > tbody > tr:nth-child(1) > td').text();
    return parseFloat(currentRatio);
}

async function getGoldSilverRatio() {
  // gold silver ratio
  const currentRatio = await getCurrentRatio();
  const goldPrice    = await getGoldPrice();
  const silverPrice  = await getSilverPrice();

  algorithm(currentRatio, goldPrice, silverPrice);
}

const getData = () => {
    let date = new Date();
    
    // date.toUTCString()
    // date, structure gsration, g, s
    // return [[date.toUTCString(), ratio, goldPrice, silverPrice]];
}

const saveData = (data) => {
    let fs = require('fs')
    fs.appendFile('log.txt', data, function (err) {
        if (err) {
            console.log('error: append failed');
        } else {
            // done
        }
    });
}
// https://stackoverflow.com/questions/33418777/node-js-write-a-line-into-a-txt-file
const writeToCsv = () => {
    const rows = [["name1", "city1", "some other info"], ["name2", "city2", "more info"]];
    let csvContent = "data:text/csv;charset=utf-8,";
    rows.forEach( (rowArray) => {
        let row = rowArray.join(",");
        csvContent += row + "\r\n";
    });
}

// code trading bot here
const algorithm = (currentRatio, goldPrice, silverPrice) => {
    
    const values = {
        currentRatio, goldPrice, silverPrice, altRatio: goldPrice/silverPrice
    }

    console.log(values);

    
    if (currentRatio > 79) {
        console.log('BUY');
    } else if (currentRatio <= 79 && currentRatio >= 50) {
        console.log('HOLD');
    } else if (currentRatio < 50 ) {
        console.log('SELL');
    } else {
        console.log('PARSING ERROR?');
    }

    // alert
    if (goldPrice < 1493) {
        console.log('HEDGE NOW');
        const cert= `https://kunde.comdirect.de/inf/zertifikate/selector/hebel/trefferliste.html?KNOCK_OUT_ABS_TO=1530&ID_NOTATION_UNDERLYING=1326189&ID_GROUP_ISSUER=&DIFFERENCE_KNOCKOUT_COMPARATOR=gt&PRESELECTION=BEAR&DIFFERENCE_KNOCKOUT_VALUE=&DIFFERENCE_KNOCKOUT_PCT_COMPARATOR=gt&PRICE_VALUE=&SEARCH_VALUE=&DIFFERENCE_KNOCKOUT_PCT_VALUE=&UNDERLYING_NAME_SEARCH=GOLD&PREMIUM_COMPARATOR=gt&DATE_TIME_MATURITY_FROM=Range_NOW&GEARING_ASK_COMPARATOR=gt&DATE_TIME_MATURITY_TO=Range_ENDLESS&SUBCATEGORY_APPLICATION=HEBEL&GEARING_ASK_VALUE=&PREMIUM_VALUE=&PRICE_COMPARATOR=gt&KNOCK_OUT_ABS_FROM=1493`;
        console.log(cert);
        exec('say  Short gold now!', maxBuffer);
    }

}

getGoldSilverRatio();


