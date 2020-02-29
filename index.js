const puppeteer = require('puppeteer');
const fs = require('fs');
const htmlToText = require('html-to-text');

const data = fs.readFileSync('config.json');
const config = JSON.parse(data);






(async () => {


    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    await Promise.all([page.goto('https://ent.colleges-isere.fr/my.policy'), page.waitForNavigation({ waitUntil: 'networkidle2' })])

    await Promise.all([page.click('#interaction_table > tbody > tr:nth-child(2) > td > a'), page.waitForNavigation({ waitUntil: 'networkidle2' })]).catch(() => {
        (async () => {
            await Promise.all([page.click('https://ent.colleges-isere.fr/my.policy'), page.waitForNavigation({ waitUntil: 'networkidle2' })])
        })
    })

    await page.click('#imgEleveParent')

    await page.screenshot({path: 'buddy-screenshot.png'});

    await Promise.all([page.click('#SubmitCreds'), page.waitForNavigation({ waitUntil: 'networkidle2' })])



    let user = config.user
    let password = config.password

    await page.type('#user', user);
    await page.type('#password', password);

    let devoirs

    page.on('response', async response => {
        if (response.url().match(/travaux\/liste/)) {
            devoirs = await response.json()
        }
    });

    await Promise.all([page.click('#bouton_connexion'), page.waitForNavigation({ waitUntil: 'networkidle2' })])
    await browser.close();

    JSON.stringify(devoirs)
    fs.writeFileSync('./data.json', JSON.stringify(devoirs))



    let str
    var nb = devoirs.nbTravailTotal;
    nb = nb - 1




    while (nb > -1) {

        if (devoirs.listJours[nb]) {
            console.log(devoirs.listJours[nb].date)

            for (let i = 0; devoirs.listJours[i]; i++) {
                str = JSON.stringify(devoirs.listJours[i].listTravail[0].matiere)
                str = suppre(str)
                console.log(str)

                str = JSON.stringify(devoirs.listJours[i].listTravail[0].description)
                str = suppre(str)
                console.log(str)

            }





        }
        nb = nb - 1;
    }

})()


function suppre(string) {
    suppr1 = /<p>/gi
    suppr2 = /<\/p>/gi
    suppr3 = /<strong>/gi
    suppr4 = /<\/strong>/gi
    suppr5 = /<span>/gi
    suppr6 = /<\/span/gi
    string = string.replace(suppr1, '')
    string = string.replace(suppr2, '')
    string = string.replace(suppr3, '')
    string = string.replace(suppr4, '')
    string = string.replace(suppr5, '')
    string = string.replace(suppr6, '')


    string = replaceHtmlEntities(string)
    string = htmlToText.fromString(string)

    return string
}

function replaceHtmlEntities(text) {

    var htmlEntities = [{
        regex: /&aacute;/g,
        entity: 'à'
    },
    {
        regex: /&eacute;/g,
        entity: 'é'
    },
    {
        regex: /&egrave;/g,
        entity: 'è'
    },
    {
        regex: /&iacute;/g,
        entity: 'í'
    },
    {
        regex: /&oacute;/g,
        entity: 'ó'
    },
    {
        regex: /&uacute;/g,
        entity: 'ú'
    },
    {
        regex: /&ugrave;/g,
        entity: 'ù'
    },
    {
        regex: /\\n/,
        entity: ""
    },
    {
        regex: /\\/g,
        entity: ""
    },
    {
        regex: />/g,
        entity: ""
    }
    ];

    total = text

    for (v in htmlEntities) {
        total = total.replace(htmlEntities[v].regex, htmlEntities[v].entity);
    }

    return total
}