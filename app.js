
var doc;
var lib;
var allPageSlots = {};

var position = "rectangle_atf";

function onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
}

function createTable(tableData) {
    var table = document.createElement('table');
    var tableBody = document.createElement('tbody');
  
    tableData.forEach(function(rowData) {
      var row = document.createElement('tr');
  
      rowData.forEach(function(cellData) {
        var cell = document.createElement('td');
        cell.appendChild(document.createTextNode(cellData));
        row.appendChild(cell);
      });
  
      tableBody.appendChild(row);
    });
  
    table.appendChild(tableBody);
    document.body.appendChild(table);
  }

window.fetch('http://cdn.api.getjad.io/library/')
    .then(function(response) {
        return response.text()
    })
    .then(function(html) {
        var parser = new DOMParser();
        doc = parser.parseFromString(html, "text/html");
        Array.from(doc.documentElement.querySelectorAll("a")).map(el => {
            window.fetch(el.href)
                .then(function(response) {
                    return response.text()
                })
                .then(function(html) {
                    var parser = new DOMParser();
                    lib = parser.parseFromString(html, "text/html");
                    var content = lib.documentElement.querySelector('body').innerText
                        content = content.replace("window.jad = window.jad || {};jad.config = jad.config || {};jad.config.pagesSlots = ", "");
                    var until = content.search(";jad.config.network")
                    content = content.substring(0, until)
                    content = JSON.parse(content)
                    for (key of Object.keys(content)) {
                        allPageSlots[key] = content[key]
                    }
                })
        })
    })

var table = [];

setTimeout(function () {
    for (const [key, value] of Object.entries(allPageSlots)) {
        if (key.includes("120157152") && key.includes("_FR_")) {
            if (typeof value[position] != "undefined" && typeof value[position].prebidConfig != "undefined") {
                var bidders = []
                for (const [index, bid] of Object.entries(value[position].prebidConfig.bids)) {
                    console.log(key, bid)
                    bidders.push(bid.bidder)
                }
                var uniqueBidders = bidders.filter(onlyUnique);
                table.push([key, ...uniqueBidders])
            }
        }
    }
    createTable(table)
}, 2000)

