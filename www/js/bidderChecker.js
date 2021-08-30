function createBidderCheckerFromFilters(bidderFilter, networkFilter, adunitFilter) {
    var libraryLinkElements = buildLibraryLinkElementsFromJadDirectoryUrl(location.protocol + '//cdn.api.getjad.io/library/')
        .then(libraryLinkElements => {
            var allPageSlots = buildAllPageSlotsFromLibraryLinkElements(libraryLinkElements)
                .then(allPageSlots => {
                    console.log(allPageSlots)
                    var allPositions = [];
                    for (const [pageStlotName, pageSlotData] of Object.entries(allPageSlots)) {
                        if (pageStlotName.includes(networkFilter) && pageStlotName.includes(adunitFilter)) {
                            for (const [positionName, positionData] of Object.entries(pageSlotData)) {
                                if (typeof positionData.prebidConfig != "undefined") {
                                    var adUnitPositions = [];
                                    adUnitPositions.push(positionName);
                                }
                                if (typeof adUnitPositions != "undefined") {
                                    allPositions.push(...adUnitPositions)
                                }
                            }
                        }
                    }
                    allUniquePositions = allPositions.filter(onlyUnique)
                    allUniquePositions.sort()
                    var adUnitsData = [];
                    for (const [pageStlotName, pageSlotData] of Object.entries(allPageSlots)) {
                        var adUnitData = [];
                        if (pageStlotName.includes(networkFilter) && pageStlotName.includes(adunitFilter)) {
                            adUnitData.push(pageStlotName);
                            allUniquePositions.map(position => {
                                if (typeof pageSlotData[position] == "undefined") {
                                    adUnitData.push("n/a")
                                } else if (typeof pageSlotData[position].prebidConfig == "undefined") {
                                    adUnitData.push("no hb")
                                } else if (typeof pageSlotData[position].prebidConfig.bids == "undefined") {
                                    adUnitData.push("no hb")
                                } else {
                                    var isPresent = false;
                                    for (el of pageSlotData[position].prebidConfig.bids) {
                                        if (el.bidder == bidderFilter) {
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
                    var tableData = [];
                    allUniquePositions.unshift("adunits");
                    tableData.push(allUniquePositions);
                    tableData.push(...adUnitsData);
                    createTable(tableData)
                })
        })
}

function updateData() {
    var bidderFilter = document.getElementById("bidderFilter").value;
    var networkFilter = document.getElementById("networkFilter").value;
    var adunitFilter = document.getElementById("adunitFilter").value;
    document.querySelector("table").remove()
    createBidderCheckerFromFilters(bidderFilter, networkFilter, adunitFilter)
}

createBidderCheckerFromFilters("appnexus","120157152","_FR_")

