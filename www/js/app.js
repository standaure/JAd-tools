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
          if (cellData === true) {
            cell.classList.add("green")
        } else if (cellData === false) {
            cell.classList.add("red")
        }
        cell.appendChild(document.createTextNode(cellData));
        row.appendChild(cell);
      });
  
      tableBody.appendChild(row);
    });
  
    table.appendChild(tableBody);
    document.body.appendChild(table);
  }

function createDivTable(tableData) {
    var table = document.createElement('div');
    table.classList.add("table")
/*     var tableBody = document.createElement('div');
    tableBody.classList.add("tableBody") */
  
    tableData.forEach(function(rowData) {
/*         var row = document.createElement('div');
        row.classList.add("row") */
  
        rowData.forEach(function(cellData) {
            var cell = document.createElement('div');
            cell.classList.add("cell")
            if (cellData === true) {
                cell.classList.add("green")
            } else if (cellData === false) {
                cell.classList.add("red")
            }
            cell.appendChild(document.createTextNode(cellData));
            table.appendChild(cell);
        });
  
/*         tableBody.appendChild(row); */
    });
  
/*     table.appendChild(tableBody); */
    document.body.appendChild(table);
}

async function buildLibraryLinkElementsFromJadDirectoryUrl(JadDirectoryUrl) {
    const parser = new DOMParser();
    const response = await fetch(JadDirectoryUrl);
    const responseText = await response.text();
    const listOfLibrariesDocument = parser.parseFromString(responseText, "text/html");
    const libraryLinkElements = listOfLibrariesDocument.documentElement.querySelectorAll("a");
    return libraryLinkElements
}



async function buildAllPageSlotsFromLibraryLinkElements(libraryLinkElements) {
    var allPageSlots = {};
    for (const [index, libraryLinkElement] of Object.entries(libraryLinkElements)) {
        const parser = new DOMParser();
        const response = await fetch(libraryLinkElement.href);
        const responseText = await response.text();
        const lib = parser.parseFromString(responseText, "text/html");
        var content = lib.documentElement.querySelector('body').innerText;
        content = content.replace("window.jad = window.jad || {};jad.config = jad.config || {};jad.config.pagesSlots = ", "");
        var until = content.search(";jad.config.network")
        content = content.substring(0, until)
        content = JSON.parse(content)
        for (key of Object.keys(content)) {
            allPageSlots[key] = content[key]
        }
    }
    return allPageSlots
} 

function createTableFromFilters(positionFilter, networkFilter, adunitFilter) {
    var libraryLinkElements = buildLibraryLinkElementsFromJadDirectoryUrl(location.protocol + '//cdn.api.getjad.io/library/')
        .then(libraryLinkElements => {
            var allPageSlots = buildAllPageSlotsFromLibraryLinkElements(libraryLinkElements)
                .then(allPageSlots => {
                    var allBidders = [];
                    var allUniqueBidders = [];
                    for (const [pageStlotName, pageSlotData] of Object.entries(allPageSlots)) {
                        var adUnitBidders = [];
                        var uniqueAdUnitBidders = [];
                        if (pageStlotName.includes(networkFilter) && pageStlotName.includes(adunitFilter)) {
                            if (typeof pageSlotData[positionFilter] != "undefined" && typeof pageSlotData[positionFilter].prebidConfig != "undefined" && typeof pageSlotData[positionFilter].prebidConfig.bids != "undefined") {
                                for (const [index, bid] of Object.entries(pageSlotData[positionFilter].prebidConfig.bids)) {
                                    adUnitBidders.push(bid.bidder)
                                }
                            }
                        }
                        if (typeof adUnitBidders != "undefined" && adUnitBidders.length > 0) {
                            adUnitBidders.map(adUnitBidder => allBidders.push(adUnitBidder))
                        }
                        var uniqueAdUnitBidders = allBidders.filter(onlyUnique)
                        allBidders.push(...uniqueAdUnitBidders)
                    }
                    allUniqueBidders = allBidders.filter(onlyUnique)
                    var adUnitsData = [];
                    for (const [pageStlotName, pageSlotData] of Object.entries(allPageSlots)) {
                        var adUnitData = [];
                        if (pageStlotName.includes(networkFilter) && pageStlotName.includes(adunitFilter)) {
                            if (typeof pageSlotData[positionFilter] != "undefined" && typeof pageSlotData[positionFilter].prebidConfig != "undefined") {
                                adUnitData.push(pageStlotName);
                                allUniqueBidders.map(bidder => {
                                    if (typeof pageSlotData[positionFilter].prebidConfig == "undefined") {
                                        adUnitData.push(false)
                                    } else if (typeof pageSlotData[positionFilter].prebidConfig.bids == "undefined") {
                                        adUnitData.push(false)
                                    } else {
                                        var isPresent = false;
                                        for (el of pageSlotData[positionFilter].prebidConfig.bids) {
                                            if (el.bidder == bidder) {
                                                adUnitData.push(true);
                                                isPresent = true;
                                                return
                                            }
                                        }
                                        if (!isPresent) {adUnitData.push(false)}
                                    }
                                })
                                adUnitsData.push(adUnitData)
                            }
                        }
                    }
                    var tableData = [];
                    allUniqueBidders.unshift("adunits");
                    tableData.push(allUniqueBidders);
                    tableData.push(...adUnitsData);
                    createTable(tableData)
                })
        })
}

function updateData() {
    var positionFilter = document.getElementById("positionFilter").value;
    var networkFilter = document.getElementById("networkFilter").value;
    var adunitFilter = document.getElementById("adunitFilter").value;
    document.querySelector("table").remove()
    createTableFromFilters(positionFilter, networkFilter, adunitFilter)
}

createTableFromFilters("rectangle_atf","120157152","_FR_")



