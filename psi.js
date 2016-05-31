const psi = require('psi');
var Table = require('cli-table');

var http = require('http');
var parseString = require('xml2js').parseString;

var table = new Table({ head: ["", "URL", "SPEED", "htmlResponseBytes", "imageResponseBytes"] });
var listURL = [];
var count = 0;


googleSpeedInsigh(psiListURL);

//Get sitemap & parse
function googleSpeedInsigh(callback) {
    return http.get({
        host: 'mitsubishi-motors.com.vn',
        path: '/sitemap'
    }, function(response) {
        // Continuously update stream with data
        var body = '';
        response.on('data', function(d) {
            body += d;
        });
        response.on('end', function() {
            var result = body.match(/<loc>(.*?)<\/loc>/g).map(function(val) {
                return val.replace(/<\/?loc>/g, '');
            });
            listURL = result;
            callback(listURL)
        });

    });
}

//PSI 
function psiListURL(list) {
    var count = 0;
    var intervalObject = setInterval(function() {
        psiURL(listURL[count]);
        count++;
        if (count == listURL.length) {
            console.log('done');
            clearInterval(intervalObject);
        }
    }, 500);
}

function psiURL(url) {
    psi(url, { key: 'AIzaSyAbijQJj5ck79PhPpxBdypNr2oy4BupJw0', strategy: 'desktop' }).then(data => {
        count++;
        console.log(count);
        table.push({ "+": [url, data.ruleGroups.SPEED.score, bytesToSize(data.pageStats.htmlResponseBytes), , bytesToSize(data.pageStats.imageResponseBytes)] });
        if (count == listURL.length) {
            console.log(table.toString());
        }
    });
}


//Convert bytes to MB
function bytesToSize(bytes) {
    var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes == 0) return '0 Byte';
    var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
    return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
};
