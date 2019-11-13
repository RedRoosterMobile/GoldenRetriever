
const settings = {
    audio: false,
    links: false
};

// https://github.com/pilwon/node-yahoo-finance
const cheerio = require('cheerio')
const yahooFinance = require('yahoo-finance')

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
    const gld = await yahooFinance.quote('SI=F');
    return gld.price.regularMarketPrice
}

// ?? 
const getUS02Price = async () => {
    const response = await yahooFinance.quote('SI=F');
    return response.price.regularMarketPrice
}
const getNetlixPrice = async () => {
    const response = await yahooFinance.quote('NFLX');
    return response.price.regularMarketPrice
}

const getUSOILPrice = async () => {
    const response = await yahooFinance.quote('Cl=F');
    return response.price.regularMarketPrice
}

const getEUBanksPrice = async () => {
    const response = await yahooFinance.quote('SX7E.Z');
    return response.price.regularMarketPrice
}

const getCoffeePrice = async () => {
    const response = await yahooFinance.quote('KC=F');
    return response.price.regularMarketPrice
}
const getShopifyPrice = async () => {
    const response = await yahooFinance.quote('SHOP');
    return response.price.regularMarketPrice
}
const getDisneyPrice = async () => {
    const response = await yahooFinance.quote('DIS');
    return response.price.regularMarketPrice
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
}

async function shouldIShortGold() {
    const gld = await yahooFinance.quote('GC=F');
    console.log('GOLD FUTURES: ' + gld.price.regularMarketPrice);
    if (gld.price.regularMarketPrice < 1495) {
        console.log('HEDGE GOLD NOW!');
        const cert= `https://kunde.comdirect.de/inf/zertifikate/selector/hebel/trefferliste.html?KNOCK_OUT_ABS_TO=1530&ID_NOTATION_UNDERLYING=1326189&ID_GROUP_ISSUER=&DIFFERENCE_KNOCKOUT_COMPARATOR=gt&PRESELECTION=BEAR&DIFFERENCE_KNOCKOUT_VALUE=&DIFFERENCE_KNOCKOUT_PCT_COMPARATOR=gt&PRICE_VALUE=&SEARCH_VALUE=&DIFFERENCE_KNOCKOUT_PCT_VALUE=&UNDERLYING_NAME_SEARCH=GOLD&PREMIUM_COMPARATOR=gt&DATE_TIME_MATURITY_FROM=Range_NOW&GEARING_ASK_COMPARATOR=gt&DATE_TIME_MATURITY_TO=Range_ENDLESS&SUBCATEGORY_APPLICATION=HEBEL&GEARING_ASK_VALUE=&PREMIUM_VALUE=&PRICE_COMPARATOR=gt&KNOCK_OUT_ABS_FROM=1493`;
        console.log(cert);
        if (settings.audio)
            exec('say  Short gold now!', maxBuffer);
        if (settings.links)
            exec('open  '+ cert, maxBuffer);
    }
    return gld;
}

async function shouldISellLong(callback , name ,cert, stopLoss, takeProfit = null) {
    const price = await callback();
    console.log(name.toUpperCase() + ': ' + price);
    if (price < stopLoss) {
        console.log('SELL '+name.toUpperCase()+' NOW!');
        console.log(cert);
        if (settings.audio)
            exec('say sell '+name+' now!', maxBuffer);
        if (settings.links)
            exec('open  '+ cert, maxBuffer);
    }
    if (takeProfit && price > takeProfit) {
        console.log('SELL '+name.toUpperCase()+' NOW! PROFIT 💰💰💰');
        console.log(cert);
        if (settings.audio)
            exec('say take profit. sell '+name+' now!', maxBuffer);
        if (settings.links)
            exec('open  '+ cert, maxBuffer);
    }
    return price;
}

async function shouldISellShort(callback , name ,cert, stopLoss, takeProfit = null) {
    const price = await callback();
    console.log(name.toUpperCase() + ': ' + price);
    if (price > stopLoss) {
        console.log('SELL  '+name.toUpperCase()+' NOW!');
        console.log(cert);
        if (settings.audio)
            exec('say cover '+name+' short now!', maxBuffer);
        if (settings.links)
            exec('open  '+ cert, maxBuffer);
    }
    if (takeProfit && price < takeProfit) {
        console.log('SELL '+name.toUpperCase()+' SHORT NOW! PROFIT 💰💰💰');
        console.log(cert);
        if (settings.audio)
            exec('say take profit. sell ' + name + ' short now!', maxBuffer);
        if (settings.links)
            exec('open  '+ cert, maxBuffer);
    }
    return price;
}

//shouldIShortGold();

const netflixCert = `https://kunde.comdirect.de/inf/optionsscheine/detail/uebersicht/uebersicht.html?ID_NOTATION=211784138`;
const crudeCert   = `https://kunde.comdirect.de/inf/optionsscheine/detail/uebersicht/uebersicht.html?ID_NOTATION=205831865`;
const silverCert  = 'https://kunde.comdirect.de/inf/optionsscheine/detail/uebersicht/uebersicht.html?ID_NOTATION=205831865';
const euBanksCert = 'https://kunde.comdirect.de/inf/optionsscheine/detail/uebersicht/uebersicht.html?ID_NOTATION=248408212';
const coffeeCert  = 'https://kunde.comdirect.de/inf/optionsscheine/detail/uebersicht/uebersicht.html?ID_NOTATION=256914419';
const shopifyLongCert  = 'https://kunde.comdirect.de/inf/optionsscheine/detail/uebersicht/uebersicht.html?ID_NOTATION=250238638';
const shopifyShortCert = 'https://kunde.comdirect.de/inf/optionsscheine/detail/uebersicht/uebersicht.html?ID_NOTATION=266543981';
const shortDisneyCert = 'https://www.comdirect.de/inf/optionsscheine/detail/uebersicht/uebersicht.html?ID_NOTATION=228971986';
// shouldISellShort(getSilverPrice, 'silver', silverCert, 17.76, 16.86 );


shouldISellShort(getEUBanksPrice, 'SX7E', euBanksCert, 95, 70);
shouldISellShort(getNetlixPrice, 'netflix', netflixCert, 264, 250.0);
shouldISellShort(getShopifyPrice, 'shopify', shopifyShortCert, 313, 280);
// shouldISellShort(getDisneyPrice, 'disney', shortDisneyCert, 134, 120);


shouldISellLong(getCoffeePrice, 'coffee', coffeeCert, 94, 110);
shouldISellLong(getUSOILPrice, 'crude', crudeCert, 52, 66);

// shouldISellShort(getShopifyPrice, 'shopify', shopifyShortCert, 313, 280);

getGoldSilverRatio();