function IEEERetrieveInfoFromPage() {
    return new Promise((resolve, reject) => {
        if(document.body.innerText.includes("We were unable to find results for")){
            resolve("")
        }
        FindLoadMoreButton(0, false).then(
            (result) => {
                console.log("All load more buttons clicked", result)
                GetIEEEArticles()
                resolve()
            }
        ).catch((e) => {
            console.error("Load more button wasn't found.", e)
            reject(e)
        });
    });
}

function GetIEEEArticles() {
    let articles = ByClassName(document, "List-results-items");
    for (let i = 0; i < articles.length; i++) {
        let articleInfo = IEEERetrieveInformationFromArticle(articles[i])
        if (articleInfo) {
            createArticle(articleInfo)
        }
    }
}

function IEEERetrieveInformationFromArticle(elem) {
    let articleElements = FirstElementByClassName(elem, "result-item-align")
    let title = ""
    let abstract = ""
    let author = ""
    let url = ""
    let description = {}
    for (let i = 0; i < articleElements.childNodes.length; i++) {
        let curElem = articleElements.childNodes[i]
        if (curElem.nodeName == "H2") {
            title = curElem.innerText.clean()
        } else if (curElem.nodeName == "P" && curElem.className == "author") {
            author = curElem.innerText.clean()
        } else if (curElem.nodeName == "DIV" && curElem.className == "description") {
            description = ProcessDescriptionElement(curElem)
        } else if (curElem.nodeName == "UL") {
            let pdfButton = FirstElementByClassName(curElem, "icon-pdf")
            if (pdfButton) {
                url = pdfButton.href
            }
        } else if (curElem.nodeName == "DIV" && curElem.className.includes("js-displayer-content")) {
            abstract = curElem.innerText.clean().replace("...\t\t\t\t\t\tView more", "")
        }
    }
    // Manage state
    let counter = GetPlatformCounter()
    IncreasePlatformCounter()
    return {
        "title": title,
        "abstract": abstract,
        "authors": author,
        "url": url,
        ...description,
        "platform": PlatformIEEE,
        "status": 1,
        "search_result_number": counter,
    }
}

function ProcessDescriptionElement(curElem) {
    let year = -1;
    let citedBy = -1;
    let publisher = ""

    let yearConfPubContainer = FirstElementByClassName(curElem, "publisher-info-container")
    let parts = yearConfPubContainer.innerText.clean().split(" | ")
    for (let j = 0; j < parts.length; j++) {
        let curPart = parts[j]
        if (curPart.includes("Year: ")) {
            let yearParsed = parseInt(curPart.split("Year: ")[1])
            if (!isNaN(yearParsed)) {
                year = yearParsed
            }
        }
        if (curPart.includes("Publisher: ")) {
            publisher = curPart.split("Publisher: ")[1].clean()
        }
    }
    for (let j = 0; j < curElem.childNodes.length; j++) {
        if (curElem.childNodes[j].innerText) {
            if (curElem.childNodes[j].innerText.includes("Cited by: ")) {
                let citedByFirstSplit = curElem.childNodes[j].innerText.clean().split("Cited by: Papers (")
                if (citedByFirstSplit.length > 0) {
                    let citedParsed = parseInt(citedByFirstSplit[1].split(")")[0])
                    if (!isNaN(citedParsed)) {
                        citedBy = citedParsed
                    }
                }
            }
        }
    }
    return {
        "cited_amount": citedBy,
        "publisher": publisher,
        "year": year,
    }
}

function FindLoadMoreButton(counter, foundButton) {
    return new Promise((resolve, reject) => {
        if (counter > 10) {
            return resolve("");
        }
        setTimeout(() => {
            let list = FirstElementByClassName(document, "List-results-items")
            let elem = FirstElementByClassName(document, "loadMore-btn")
            if (!elem && list) {
                resolve("done")
            }
            if (elem) {
                elem.click();
                return FindLoadMoreButton(counter, true).then(
                    (result) => {
                        return resolve(result)
                    }
                );
            } else {
                if (foundButton) {
                    return resolve("done");
                }
                counter++
                return FindLoadMoreButton(counter, false).then(
                    (result) => {
                        return resolve(result)
                    }
                );
            }
        }, 1000);
    });
}
