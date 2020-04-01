function WebOfScienceHandler() {
    return new Promise((resolve) => {
        let curHref = window.location.href
        let state = GetState()
        let counter = GetPlatformCounter()
        if (counter == 0) {
            if(document.body.innerText.includes("Your search found no records.")){
                resolve("")
            }
            if (curHref.includes("WOS_GeneralSearch_input.do")) {
                let sqInput = ByID(document, "value(input1)")
                sqInput.value = state.next_url
                let button = FirstElementByClassName(document, "searchButton").children[0]
                button.click()
            } else if (curHref.includes("Search.do") || curHref.includes("summary.do")) {
                resolve(WebOfScienceRetrieveInfoFromPage())
            } else if (curHref.includes("error/Error")){ 
                resolve("")
            } else {
                window.location.href = "https://apps.webofknowledge.com/home.do"
            }
        } else {
            let state = GetState()
            if (window.location.href != state.next_url) {
                GoToNextURL()
                return
            }
            resolve(WebOfScienceRetrieveInfoFromPage())
        }
    })
}

function WebOfScienceRetrieveInfoFromPage() {
    return new Promise(async (resolve) => {
        let articles = ByClassName(document, "search-results-item")
        for (let i = 0; i < articles.length; i++) {
            let res = {}
            try {
                res = await WebOfScienceRetrieveInformationFromArticle(articles[i])
            } catch (e) {
                console.warn("no abstract found", e)
            }
            createArticle(res)
        }

        let nextURLElem = FirstElementByClassName(document, "paginationNext")
        let nextURL = ""
        if (nextURLElem) {
            if (nextURLElem.href.startsWith("https://")) {
                nextURL = nextURLElem.href
            }
        }

        resolve(nextURL)
    });
}

function getAuthors(elem) {
    let resultDivs = FirstElementByClassName(elem, "search-results-content")
    for (let i = 0; i < resultDivs.children.length; i++) {
        let inner = resultDivs.children[i].innerText
        if (inner.startsWith("By:")) {
            return inner.split(";").join(" ;");
        }
    }
    return ""
}

function getYear(elem) {
    let resultDivs = FirstElementByClassName(elem, "search-results-content")
    for (let i = 0; i < resultDivs.children.length; i++) {
        let inner = resultDivs.children[i].innerText
        if (inner.includes("Published:")) {
            let splitted = inner.split("Published:")
            let yearContainer = splitted[splitted.length - 1]
            let yearSplitted = yearContainer.split(" ")
            for (j = 0; j < yearSplitted.length; j++) {
                let year = parseInt(yearSplitted[j])
                if (!isNaN(year)) {
                    return year
                }
            }
        }
    }
    return -1
}

function findDOI(elem) {
    if (!elem) {
        return ""
    }
    if (elem.getAttribute("name") && elem.getAttribute("name") == "doi") {
        return elem.innerText
    }
    if (elem.children) {
        for (let i = 0; i < elem.children.length; i++) {
            let doiChild = findDOI(elem.children[i])
            if (doiChild != "") {
                return doiChild
            }
        }
    }
    return ""
}

async function WebOfScienceRetrieveInformationFromArticle(elem) {
    return new Promise(async (resolve, reject) => {
        let titleContainer = FirstElementByClassName(elem, "snowplow-full-record")
        let url = titleContainer.href
        let title = titleContainer.innerText

        let abstract = ""
        try {
            abstract = await getAbstract(elem)
        } catch (e) {
            console.warn("no abstract found", e)
        }
        let citedElem = FirstElementByClassName(elem, "snowplow-times-cited-link")
        let cited = 0
        if (citedElem) {
            let citedString = citedElem.innerText
            let temp = parseInt(citedString)
            if (!isNaN(temp)) {
                cited = temp
            }
        }
        let doi = findDOI(elem)
        let authors = getAuthors(elem)
        let year = getYear(elem)
        // Manage state
        let counter = GetPlatformCounter()
        IncreasePlatformCounter()
        resolve({
            "abstract": abstract,
            "title": title,
            "url": url,
            "authors": authors,
            "doi": doi,
            "year": year,
            "cited_amount": cited,
            "platform": PlatformWebOfScience,
            "search_result_number": counter,
            "status": 1,
        })
    })
}

function getAbstract(elem) {
    return new Promise(async (resolve, reject) => {
        let abstractButton = FirstElementByClassName(elem, "abstract-text")
        if (abstractButton) {
            abstractButton.click()
            var evt = document.createEvent('MouseEvents')
            evt.initMouseEvent('mousedown', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
            abstractButton.dispatchEvent(evt)
            let res = ""
            for (let i = 0; i < 100; i++) {
                if (res != "") {
                    break
                }
                try {
                    res = await checkAbstractPresent(elem)
                    break
                } catch (e) {
                }
            }
            resolve(res)
        } else {
            reject("")
        }
    })
}


function checkAbstractPresent(elem) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            let abstractContainer = FirstElementByClassName(elem, "formBoxesAbstract")
            if (abstractContainer) {
                resolve(abstractContainer.innerText)
            } else {
                reject("")
            }
        }, 20)
    })
}