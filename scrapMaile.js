var request = require('request');
var cheerio = require('cheerio');
let domain = "www.bazarek.pl"
var StartUrl = 'https://'+domain;
var fs = require('fs');

var text = fs.readFileSync('links.json','utf8')
let AllLinks = text.split(",");

var text = fs.readFileSync('emails.json','utf8')
let AllEmails = text.split(",");

function save(){
    fs.writeFileSync('emails.json', AllEmails);
    fs.writeFileSync('links.json', AllLinks);
}
setInterval(save, 5000);
let CurrentLinks = [];
function extractEmails (text)
{
    return text.match(/(?!\S*\.(?:jpg|png|gif|jpeg|io)(?:[\s\n\r]|$))[A-Z0-9._%+-]+@[A-Z0-9.-]{2,65}\.[A-Z]{2,4}/gi);
}
function Scrapping(url){
    console.log(url)
    console.log(AllEmails)
    if(url!=StartUrl){
        AllLinks.push(url);
    }
    request(url, function(err, resp, body){
        if(body) {
            $ = cheerio.load(body);
            let emails = extractEmails(body)
            if(emails) {
                var uniq = emails.reduce(function (a, b) {
                    if (a.indexOf(b) < 0) a.push(b);
                    return a;
                }, []);
                for (x in uniq) {
                    let Add = true;
                    for (y in AllEmails) {
                        if (AllEmails[y] == uniq[x]) {
                            console.log(AllEmails[y], uniq[x])
                            Add = false;
                        }
                    }
                    if (Add == true) {
                        AllEmails.push(uniq[x]);
                    }
                }
            }
            links = $('a'); //jquery get all hyperlinks
            $(links).each(function (i, link) {
                let href = $(link).attr('href')
                if(href){

                    if (href.indexOf("http") == -1 && href.indexOf("https") == -1) {
                        href = "https://" + domain + href
                    }
                    if ((href.indexOf("http") > -1 || href.indexOf("https") > -1) && href.indexOf(domain) > -1 && href.indexOf(".jpg") == -1 && href.indexOf(".jpeg") == -1 && href.indexOf(".png") == -1 && href.indexOf(".svg") == -1 && href.indexOf(".pdf") == -1) {
                        //console.log(href)
                        let Add = true;
                        for (let x in AllLinks) {
                            if (href == AllLinks[x]) {
                                Add = false;
                            }
                        }
                        if (Add == true) {
                            CurrentLinks.push(href);
                            AllLinks.push(href)
                        }
                    }
                }
            });
            if (CurrentLinks[0]) {
                Scrapping(CurrentLinks[0]);
                CurrentLinks.shift()
            }
        }else{
            if (CurrentLinks[0]) {
                Scrapping(CurrentLinks[0]);
                CurrentLinks.shift()
            }
        }
    });
}
for(let x=0; x<100; x++){
    Scrapping(StartUrl);
}




