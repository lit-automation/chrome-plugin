function ScienceDirectRetrieveInfoFromPage() {
    return new Promise(async (resolve) => {
        let articles = ByClassName(document, "result-item-content")
        let promises = []
        for (let i = 0; i < articles.length; i++) {
            promises.push(ScienceDirectRetrieveInformationFromArticle(articles[i]))
        }

        let nextURLElem = FirstElementByClassName(document, "next-link")
        let nextURL = ""
        if (nextURLElem) {
            let hrefElem = nextURLElem.children[0]
            if (hrefElem) {
                nextURL = hrefElem.href
            } else {
                nextURL = ""
            }
        }

        Promise.all(promises).then(values => {
            for (let i = 0; i < values.length; i++) {
                createArticle(values[i])
            }
            resolve(nextURL)
        })
       
    });
}

function findDOI(elem) {
    if (!elem) {
        return ""
    }
    if (elem.parentElement) {
        if (elem.getAttribute("data-doi")) {
            return elem.getAttribute("data-doi")
        } else {
            return findDOI(elem.parentElement)
        }
    } else {
        return ""
    }
}

function ScienceDirectRetrieveInformationFromArticle(elem) {
    return new Promise(async (resolve, reject) => {
        let doi = findDOI(elem)
        let titleContainer = FirstElementByClassName(elem, "result-list-title-link")
        let url = titleContainer.href
        let title = titleContainer.innerText

        let journal = FirstElementByClassName(elem, "subtype-srctitle-link")
        let abstract = ""
        try {
            abstract = await getAbstract(elem)
        } catch (e) {
            console.warn("no abstract found", e)
        }
        let authorsElem = FirstElementByClassName(elem, "Authors")
        let authors = authorsElem.innerText.split(",").join(" ;");

        // Manage state
        let counter = GetPlatformCounter()
        IncreasePlatformCounter()
        resolve({
            "url": url,
            "doi": doi,
            "authors": authors,
            "abstract": abstract,
            "title": title,
            "journal": journal.innerText,
            "platform": PlatformScienceDirect,
            "cited_amount": -1,
            "search_result_number": counter,
            "status": 1,
            "year": findYear(elem)
        })
    })
}

function findYear(elem) {
    let subTypes = FirstElementByClassName(elem, "SubType")
    for (let i = 0; i < subTypes.children.length; i++) {
        let splitted = subTypes.children[i].innerText.split(" ")
        for (let j = 0; j < splitted.length; j++) {
            if (splitted[j].length == 4) {
                let year = parseInt(splitted[j])
                if (!isNaN(year)) {
                    return year
                }
            }
        }
    }
    return -1
}

function getAbstract(elem) {
    return new Promise((resolve, reject) => {
        let abstractButton = FirstElementByClassName(elem, "button-link")
        if (abstractButton) {
            abstractButton.click()
            var evt = document.createEvent('MouseEvents')
            evt.initMouseEvent('mousedown', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
            abstractButton.dispatchEvent(evt)
            let abstractContainer = FirstElementByClassName(elem, "ArticlePreview")
            setTimeout(() => {
                let abstractContainer = FirstElementByClassName(elem, "ArticlePreview")
                if (abstractContainer) {
                    resolve(abstractContainer.innerText)
                } else {
                    reject("")
                }
            }, 2000)
        } else {
            reject("")
        }
    })
}
