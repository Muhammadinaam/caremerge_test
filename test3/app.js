var url = require('url');
var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');

function generateHTML(li_items)
{
    var html = 
    `
    <html>
    <head></head>
    <body>

        <h1> Following are the titles of given websites: </h1>

        <ul>
        `+li_items+`
        </ul>
    </body>
    </html>
    `;

    return html;
}


function getWebsitesTitles(addresses)
{
    return new Promise(function(resolve, reject){
        console.log('getting website title');
        var liData = "";

        var addressesProcessed = 0;
        addresses.forEach(address => {

            var addressWithHttp = address.includes('http://') ? address : 'http://' + address;

            request(addressWithHttp, function(error, response, html){
                if(!error){
                    var $ = cheerio.load(html);
        
                    $('title').filter(function(){
                        var data = $(this);
                        title = $(this).text();
                        console.log('title: '+title);
                    });
                }
                else
                {
                    console.log(error);
                    title = error;
                }

                liData += '<li>'+address + ' - "'+title+'"' +'</li>';
                addressesProcessed++;
                
                if(addressesProcessed === addresses.length ){
                    resolve(liData);
                }
            })    

        });
    });

}

function sendHTMLResponseWithWebsiteTitles(liData, response)
{
    response.writeHead(200, {'Content-Type': 'text/html'});
    response.write(generateHTML(liData));
    response.end();
}

module.exports = {
    handleRequest: function(req, res){

        var q = url.parse(req.url, true);
        var path = q.pathname;

        // 404
        if(path != "/I/want/title/")
        {
            res.writeHead(404, {'Content-Type': 'text/plain'});
            res.write('404 - Page not found');
            res.end();
            return;
        }

        if( q.query.address && q.query.address.length > 0)
        {
            getWebsitesTitles(q.query.address)
                .then(function(liData){
                    sendHTMLResponseWithWebsiteTitles(liData, res);
                });
        }
        else
        {
            res.writeHead(200, {'Content-Type': 'text/plain'});
            res.write('No websites specified');
            res.end();
            return;
        }
        
    }
}