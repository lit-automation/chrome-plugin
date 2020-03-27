
const StepStart = "Start";
const StepSnowballing = "Snowballing";
const StepDone = "SnowballingDone";

let defaultSnowBallState = {
    "step": StepStart,
    "counter": 0,
    "snowball_url": "",
    "article_id": "",
    "project_id": "",
    "cited_amount": -1,
    "cited_by": new Array(),
}

function GetSnowBallState() {
    let state = JSON.parse(localStorage.getItem('snowball_state'));
    if (state == null) {
        return {};
    }
    return state
}

function SetDefaultState() {
    StoreSnowBallState(defaultSnowBallState)
}

function StoreSnowBallState(state) {
    localStorage.setItem('snowball_state', JSON.stringify(state))
}

function NewSnowBall(articleID, projectID) {
    let temp = defaultSnowBallState;
    temp.article_id = articleID
    temp.project_id = projectID
    StoreSnowBallState(temp)
}

function SnowBall() {
    let state = GetSnowBallState()
    let error = false
    state.snowball_url = ''
    if (state.counter < 5) {
        console.log("COUNTER NOT REACHED")
        switch (state.step) {
            case StepStart:
                let result = findCitesAndCitedArticles()
                if (result.snowball_url) {
                    state.cited_amount = result.cited_amount;
                    state.snowball_url = result.snowball_url;
                    state.step = StepSnowballing;
                } else {
                    error = true
                }
                StoreSnowBallState(state)
                break
            case StepSnowballing:
                SnowBallPage()
                break
        }
        if (error) {
            console.error("Something went wrong")
            return
        }
    }
    state = GetSnowBallState()

    if (state.snowball_url != "" && state.counter < 5) {
        setTimeout(() => {
            window.location.href = state.snowball_url
        }, 500)
    } else {
        console.log("UPDATE CITED")
        updateArticle({ "cited_by": btoa(unescape(encodeURIComponent(JSON.stringify(state.cited_by)))) }, state.article_id, state.project_id)
        SetDefaultState()
        chrome.runtime.sendMessage({ event: 'next_snowball' }, response => {
            if (response) {
                receiveStateFromPopup(response)
            } else if (chrome.runtime.lastError) {
                if (counter == 3) {
                    displayMessage("Please keep the popup window open while gathering articles")
                }
                counter++
                setTimeout(() => {
                    requestStateFromPopup(counter)
                }, 1000);
            }
        });
    }
}

function findCitesAndCitedArticles() {
    // Read amount of cited
    let children = $("#gs_res_ccl_mid").children();
    if (children.length != 1) {
        console.warn("Can't be sure of the amount cited")
    }
    if (children.length > 0) {
        let elem = children[0]
        let row = FirstElementByClassName(elem, "gs_ri")
        for (let i = 0; i < row.children.length; i++) {
            if (row.children[i].innerText.includes("Cited by")) {
                let correctContainer = row.children[i];
                for (let j = 0; j < correctContainer.children.length; j++) {
                    if (correctContainer.children[j].innerText.includes("Cited by")) {
                        let amountCited = correctContainer.children[j].innerText.split("Cited by ")[1]
                        if (!parseInt(amountCited)) {
                            return {}
                        }
                        return {
                            "snowball_url": correctContainer.children[j].href,
                            "cited_amount": parseInt(amountCited),
                        }
                    }
                }
            }
        }
    }
    return {}
}

function SnowBallPage() {
    let articles = GetScholarArticles()
    let result = new Array();
    for (let i = 0; i < articles.length; i++) {
        if (articles[i].nodeName == "#text") {
            continue
        }
        let articleInfo = RetrieveInformationFromScholarArticle(articles[i])
        if (articleInfo) {
            if (articleInfo.cited_amount != -1) {
                result.push({
                    "doi": articleInfo.doi,
                    "title": articleInfo.title,
                    "url": articleInfo.url,
                    "cited_amount": articleInfo.cited_amount,
                })
            }
        }
    }

    let state = GetSnowBallState()
    state.counter = state.counter + 1
    state.cited_by = state.cited_by.concat(result)
    state.snowball_url = GetNextScholarURL()
    StoreSnowBallState(state)
}