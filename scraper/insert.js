$(document).ready(() => {
    // Append message display element to the body of the current page
    var objRef = document.body;
    var messageContainer = document.createElement("div");
    messageContainer.id = "messageContainer"
    objRef.prepend(messageContainer)

    let state = GetState()
    // If last saved state was active we should ask the current state from the popup
    if (state.status != Paused) {
        requestStateFromPopup(0);
    }
});

function displayMessage(message) {
    let messageContainer = ByID(document, "messageContainer")
    messageContainer.innerText = message

    messageContainer.classList.add("testmessageShow")
    setTimeout(() => {
        messageContainer.classList.remove("testmessageShow")
    }, 5000);
}

function requestStateFromPopup(counter) {
    if (counter > 30) {
        return;
    }
    chrome.runtime.sendMessage({ event: 'get_state' }, response => {
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

function storeStateInPopup(counter, increasePlatformCounter) {
    if (counter > 30) {
        return;
    }
    chrome.runtime.sendMessage({ event: 'store_state', state: GetState(), increase_platform_counter: increasePlatformCounter }, response => {
        if (response) {
            console.log("Receive store state result go to next page", response)
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

function receiveStateFromPopup(response) {
    if (!response.jwt) {
        console.warn("Expected jwt")
        return
    }
    if (!response.state) {
        console.warn("Expected state")
        return
    }
    StoreJWT(response.jwt)
    StoreState(response.state)
    CheckStateForScraping()
}

function CheckStateForScraping() {
    let state = GetState()
    if (state.status == Active) {
        if (!state.next_url) {
            return;
        }
        if (window.location.href != state.next_url) {
            if (GetCurrentPlatform() != PlatformWebOfScience) {
                GoToNextURL()
                return
            }
        }
        let nextURL = ""
        switch (GetCurrentPlatform()) {
            case PlatformScholar:
                nextURL = ScholarRetrieveInfoFromPage()
                if (nextURL == "CAPTCHA") {
                    return
                }
                handleNextURL(nextURL)
                break;
            case PlatformIEEE:
                IEEERetrieveInfoFromPage().then((result) => {
                    console.log("DONE WITH IEEE", result)
                    handleNextURL(nextURL)
                }).catch((e) => {
                    console.log("TODO handle error", e)
                })
                break
            case PlatformACM:
                nextURL = ACMRetrieveInfoFromPage()
                handleNextURL(nextURL)
                break
            case PlatformSpringer:
                nextURL = SpringerRetrieveInfoFromPage()
                handleNextURL(nextURL)
                break
            case PlatformScienceDirect:
                ScienceDirectRetrieveInfoFromPage().then((url) => {
                    handleNextURL(url)
                })
                break
            case PlatformWebOfScience:
                WebOfScienceHandler().then((url) => {
                    handleNextURL(url)
                })

                break
            default:
                console.error("Unknown platform"), GetCurrentPlatform()
        }
    } else if (state.status == SnowballStatus) {
        let snowBallState = GetSnowBallState()
        if (!snowBallState.article_id) {
            NewSnowBall(state.snowball.id, state.project_id)
            snowBallState = GetSnowBallState()
            setTimeout(() => {
                window.location.href = "https://scholar.google.com/scholar?q=" + encodeURI(state.snowball.title) + "&hl=en&as_sdt=0,5"
            }, 600)
        } else {
            SnowBall()
        }
    }
}

function handleNextURL(nextURL) {
    if (!nextURL || nextURL == "") {
        SetNextURL("")
        storeStateInPopup(0, true)
    } else {
        SetNextURL(nextURL)
        storeStateInPopup(0, false)
    }
}

function GoToNextURL() {
    setTimeout(() => {
        let state = GetState()
        if (state.status == Active) {
            let nextURL = GetCurrentNextURL()
            if (window.location.href != nextURL) {
                window.location.href = nextURL;
            }
        }
    }, 1000);
}

// In case contacted retrieve state from popup
chrome.runtime.onMessage.addListener(
    (request, sender, sendResponse) => {
        requestStateFromPopup(0);
        sendResponse("active")
    });
