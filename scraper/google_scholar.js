function ScholarRetrieveInfoFromPage() {
    let captcha = HasScholarCaptcha()
    if (captcha) {
        return "CAPTCHA"
    }
    let articles = GetScholarArticles()
    for (let i = 0; i < articles.length; i++) {
        if (articles[i].nodeName == "#text") {
            continue
        }
        let articleInfo = RetrieveInformationFromScholarArticle(articles[i])
        if (articleInfo != undefined) {
            createArticle(articleInfo)
        }
    }
    return GetNextScholarURL()
}

function HasScholarCaptcha() {
    let captcha = ByID(document, "gs_captcha_f")
    if (captcha != undefined && captcha.innerText.includes("Please show you're not a robot")) {
        return true
    }
    return false
}

function GetNextScholarURL() {
    let elem = FirstElementByClassName(document, "gs_ico_nav_next")
    if (!elem) {
        return ""
    }
    if (!elem.parentNode) {
        return ""
    }
    return elem.parentNode.href
}

function GetScholarArticles() {
    let articleContainer = ByID(document, "gs_res_ccl_mid")
    return articleContainer.childNodes
}

function RetrieveInformationFromScholarArticle(elem) {
    let articleElements = FirstElementByClassName(elem, "gs_ri")
    if (articleElements.childNodes.length != 4) {
        console.warn("incorrect number of childs for article node")
        return null
    }
    let titleContainer = articleElements.childNodes[0]

    let pubContainer = articleElements.childNodes[1]

    let abstractContainer = articleElements.childNodes[2]

    let citedContainer = articleElements.childNodes[3]
    // Manage state
    let counter = GetPlatformCounter()
    IncreasePlatformCounter()
    return {
        ...GetScholarAuthorsYearAndPublisher(pubContainer),
        ...GetScholarTitleAndURL(titleContainer),
        "abstract": GetScholarAbstract(abstractContainer),
        "cited_amount": GetScholarCitedAmount(articleElements),
        "platform": PlatformScholar,
        "status": 1,
        "search_result_number": counter,
    }
}

function GetScholarTitleAndURL(elem) {
    for (let i = 0; i < elem.childNodes.length; i++) {
        if (elem.childNodes[i].nodeName == "A") {
            let doi = ""
            if (elem.childNodes[i].href.includes("/doi/abs/")) {
                let splitted = elem.childNodes[i].href.split("/doi/abs/")
                let doiPart = splitted[splitted.length - 1]
                doi = doiPart.split("?")[0]
            } else if (elem.childNodes[i].href.includes("/doi/pdf/")) {
                let splitted = elem.childNodes[i].href.split("/doi/pdf/")
                let doiPart = splitted[splitted.length - 1]
                doi = doiPart.split("?")[0]
            }
            return {
                "title": elem.childNodes[i].innerText,
                "url": elem.childNodes[i].href,
                "doi": doi,
            }
        }
    }
    console.warn("no title found")
    return {}
}

function GetScholarAbstract(elem) {
    return elem.innerText
}

function GetScholarAuthorsYearAndPublisher(elem) {
    let innerText = elem.innerText
    let infoArray = innerText.split("-")
    if (infoArray.length != 3) {
        console.warn("Length info array not 3, got: ", infoArray.length)
    }
    let author = ""
    let publisher = ""
    let year = -1
    let journal = ""
    for (i = 0; i < infoArray.length; i++) {
        switch (i) {
            case 0:
                author = infoArray[i].trim()
                break;
            case 1:
                journal = infoArray[i].trim()
                year = GetScholarYear(infoArray[i])
                break
            case 2:
                publisher = infoArray[i].trim()
                break;
            default:
                console.info("unknown property:", infoArray[i])
        }
    }
    return {
        "authors": author,
        "publisher": publisher,
        "year": year,
        "journal": journal,
    }
}

function GetScholarYear(yearText) {
    let splitted = yearText.split(",")
    if (splitted.length == 1) {
        console.warn("no year found")
        return -1
    }
    let yearString = splitted[splitted.length - 1].trim()
    let yearInt = parseInt(yearString)
    if (isNaN(yearInt)) {
        return -1
    }
    return yearInt
}

function GetScholarCitedAmount(elem) {
    for (let i = 0; i < elem.children.length; i++) {
        if (elem.children[i].innerText.includes("Cited by")) {
            let correctContainer = elem.children[i];
            for (let j = 0; j < correctContainer.children.length; j++) {
                if (correctContainer.children[j].innerText.includes("Cited by")) {
                    let amountCited = correctContainer.children[j].innerText.split("Cited by ")[1]
                    if (!parseInt(amountCited)) {
                        return -1
                    }
                    return parseInt(amountCited)
                }
            }
        }
    }
    return -1
}