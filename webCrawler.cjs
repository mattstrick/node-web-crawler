const cheerio = require('cheerio');
const { syncBuiltinESMExports } = require('module');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

(async () => {
    const urlToCrawl = 'https://newsforkids.net/';
    const maxPages = 100;

    const pagesToCrawl = [];
    const crawledPages = [];
    const hasSameDomain = (href) => {
        if (href?.includes(urlToCrawl)) {
            return true;
        }

        return false;
    }
    const isNewPage = (href) => {
        let newPage = true;

        pagesToCrawl.forEach(entry => {
            if (entry === href) {
                newPage = false;
            }
        });        
        crawledPages.forEach(entry => {
            if (entry === href) {
                newPage = false;
            }
        })

        return newPage;
    }
    const shouldAddPage = () => {
        if (pagesToCrawl.length + crawledPages.length < maxPages) {
            return true;
        }

        return false;
    }
    const fetchUrlAndAddLinks = (url) => {
        fetch(url)
        .then(res => {        
            return res.text();
        })
        .then(text => {
            const $ = cheerio.load(text);
            $('a').each((index, element) => {
                const link = $(element).attr('href');
                if (hasSameDomain(link) && isNewPage(link) && shouldAddPage()) {
                    pagesToCrawl.push(link);                    
                }
            });  
            console.log(pagesToCrawl.length + ' pages to crawl');
        })
        .then(async () => {
            const page = pagesToCrawl.pop();
            await fetchUrlAndAddLinks(page);
            crawledPages.push(page)
        });        
    }
    
    // Script
    await fetchUrlAndAddLinks(urlToCrawl);
})()


