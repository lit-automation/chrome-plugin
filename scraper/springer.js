function SpringerRetrieveInfoFromPage() {
    let articles = ByID(document, "results-list")
    for (let i = 0; i < articles.children.length; i++) {
        let articleResult = SpringerRetrieveInformationFromArticle(articles.children[i])
        if (articleResult) {
            createArticle(articleResult)
        }
    }
    let nextURLElem = FirstElementByClassName(document, "next")
    if (nextURLElem) {
        return nextURLElem.href
    }
    return ""
}

function SpringerRetrieveInformationFromArticle(elem) {
    let titleURLAndDOI = SpringerGetTitleAndHREF(FirstElementByClassName(elem, "title"))
    let abstract = ""
    if (FirstElementByClassName(elem, "snippet")) {
        abstract = FirstElementByClassName(elem, "snippet").innerText
    }

    let authors = ""
    let authorsElem = FirstElementByClassName(elem, "authors")
    if (authorsElem) {
        authorsElem.innerText.split(",").join(" ; ");
    }

    let journal = ""
    let pubElem = FirstElementByClassName(elem, "publication-title")
    if (pubElem) {
        journal = pubElem.innerText
    }
    let year = -1;
    let yearElem = FirstElementByClassName(elem, "year")
    if (yearElem) {
        let yearTitle = parseInt(yearElem.innerText.substring(1, FirstElementByClassName(elem, "year").innerText.length - 1))
        if (!isNaN(yearTitle)) {
            year = yearTitle
        }
    }
    let counter = GetPlatformCounter()
    IncreasePlatformCounter()
    return {
        "authors": authors,
        ...titleURLAndDOI,
        "journal": journal,
        "search_result_number": counter,
        "year": year,
        "abstract": abstract,
        "status": 1,
        "platform": PlatformSpringer,
        "cited_amount": -1,
    }
}

function SpringerGetTitleAndHREF(elem) {
    if (!elem) {
        return {}
    }
    let titleElem = elem
    let doi = ""
    let splittedLink = titleElem.href.split("/")
    if (splittedLink.length > 3) {
        doi = splittedLink[splittedLink.length - 2] + "/" + splittedLink[splittedLink.length - 1]
    }
    return {
        "title": titleElem.innerText,
        "url": titleElem.href,
        "doi": doi
    }
}
