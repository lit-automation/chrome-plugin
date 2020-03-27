function ACMRetrieveInfoFromPage() {
    let articles = ByClassName(document, "issue-item-container")
    for (let i = 0; i < articles.length; i++) {
        let articleResult = ACMRetrieveInformationFromArticle(articles[i])
        if (articleResult) {
            createArticle(articleResult)
        }
    }
    let nextURLElem = FirstElementByClassName(document, "pagination__btn--next")
    if (nextURLElem) {
        return nextURLElem.href
    }
    return ""
}

function ACMRetrieveInformationFromArticle(elem) {
    let articleInfoWrapper = FirstElementByClassName(elem, "issue-item")
    let articleInnerWrapper = FirstElementByClassName(articleInfoWrapper, "issue-item__content")
    let articleContainer = FirstElementByClassName(articleInnerWrapper, "issue-item__content-right")

    let titleAndURL = ACMGetTitleAndHREF(FirstElementByClassName(articleContainer, "issue-item__title"))
    let abstract = FirstElementByClassName(articleContainer, "issue-item__abstract").innerText.trim()
    let authors = ACMGetAuthors(FirstElementByClassName(articleContainer, "rlist--inline"))
    let yearAndJournal = ACMGetYearAndJournal(FirstElementByClassName(articleContainer, "issue-item__detail"))
    let cited = ACMGetAmountCited(FirstElementByClassName(articleContainer, "issue-item__footer"))
    // Manage state
    let counter = GetPlatformCounter()
    IncreasePlatformCounter()
    return {
        "authors": authors,
        ...titleAndURL,
        ...yearAndJournal,
        "abstract": abstract,
        "platform": PlatformACM,
        "cited_amount": cited,
        "status": 1,
        "search_result_number": counter,
    }
}

function ACMGetAmountCited(elem) {
    let inner = FirstElementByClassName(elem, "issue-item__footer-wrapper")
    let citeWrapper = FirstElementByClassName(inner, "issue-item__footer-info")
    let test = FirstElementByClassName(citeWrapper, "citation")
    let cited = parseInt(test.innerText)
    if (isNaN(cited)) {
        return -1
    }
    return cited
}

function ACMGetYearAndJournal(elem) {
    if (!elem) {
        return {}
    }
    let journal = elem.children[0].innerText
    let dotSeparator = FirstElementByClassName(elem, "dot-separator")
    for (let i = 0; i < dotSeparator.children.length; i++) {
        let temp = dotSeparator.children[i].innerText
        temp = temp.split(",").join(" ");
        let splitted = temp.split(" ")
        for (let j = 0; j < splitted.length; j++) {
            let yearInt = parseInt(splitted[j].trim())
            if (!isNaN(yearInt)) {
                return {
                    "journal": journal,
                    "year": yearInt,
                }
            }
        }
    }
    return {
        "journal": journal,
        "year": -1,
    }
}

function ACMGetAuthors(elem) {
    let authors = ""
    for (let i = 0; i < elem.children.length; i++) {
        authors += elem.children[i].children[0].innerText
        if (i + 1 != elem.children.length) {
            authors += " ; "
        }
    }
    return authors
}

function ACMGetTitleAndHREF(elem) {
    let titleElem = elem.children[0].children[0]
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
