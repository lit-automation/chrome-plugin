

document.getElementById('play').addEventListener('click', () => {
    StartState().then(() => {
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            chrome.tabs.sendMessage(tabs[0].id, { click: "play" }, response => {
                if (chrome.runtime.lastError) {
                    displayMessage("Can't start scraping please refresh the page")
                }
            });
        })
    }).catch((e) => {
        displayMessage(e)
    });

});

document.getElementById('pause').addEventListener('click', () => {
    PauseState()
});

document.getElementById('snowball').addEventListener('click', () => {
    StartSnowballState().then((res) => {
        if (res.id == "00000000-0000-0000-0000-000000000000") {
            displayMessage("No articles to snowball")
        } else {
            chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
                chrome.tabs.sendMessage(tabs[0].id, { click: "play" }, response => {
                    if (chrome.runtime.lastError) {
                        displayMessage("Can't start scraping please refresh the page")
                    }
                });
            })
        }
    }).catch((e) => {
        displayMessage(e)
    })
});

document.getElementById('pauseSnowball').addEventListener('click', () => {
    PauseState()

});


document.getElementById('signIn').addEventListener('click', () => {
    signIn()
});

document.getElementById('pass').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        signIn()
    }
});

document.getElementById('editProject').addEventListener('click', () => {
    editProject()
});

document.getElementById('addProject').addEventListener('click', () => {
    addProjectFromForm()
});

// Menu button clicks
document.getElementById('home').addEventListener('click', () => {
    menuClicked("home");
});

document.getElementById('newproject').addEventListener('click', () => {
    menuClicked("newproject");
});

document.getElementById('projects').addEventListener('click', () => {
    menuClicked("projects");
});

document.getElementById('settings').addEventListener('click', () => {
    menuClicked("settings");
});

document.getElementById('signOut').addEventListener('click', () => {
    SignOut()
    setSignedOut()
});

$(document).ready(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (IsSignedIn()) {
            setSignedIn()
            checkProject()
        } else {
            setSignedOut()
        }
    });
});

function displayMessage(message) {
    let messageElem = ByID(document, "messageDisplay")
    messageElem.innerHTML = message;
    messageElem.classList.add("messageShow")
    setTimeout(() => {
        messageElem.classList.remove("messageShow")
        messageElem.innerHTML = "";
    }, 4000)
}

function signIn() {
    let email = ByID(document, "email")
    let pass = ByID(document, "pass")
    let invalid = false
    if (email.value == '') {
        email.classList.add("invalid");
        invalid = true
    } else {
        email.classList.remove("invalid");
    }
    if (pass.value == '') {
        pass.classList.add("invalid");
        invalid = true
    } else {
        pass.classList.remove("invalid");
    }
    if (invalid) {
        return
    }

    var token = email.value + ":" + pass.value;

    var basicAuth = "Basic " + btoa(token);
    signInAPI(basicAuth)
    email.value = ''
    pass.value = ''
}

// respond to a message
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (!IsSignedIn()) {
        console.warn("requesting while not logged in", request)
        return;
    }
    if (!request.event) {
        console.error("unknown request", request)
        return
    }
    let jwt = GetJWT()
    let state = {}
    switch (request.event) {
        case "get_state":
            state = GetState()
            sendResponse({ state: state, jwt: jwt })
            break
        case "store_state":
            StoreStateFromInsert(request.state, request.increase_platform_counter).then((res) => {
                chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
                    chrome.tabs.sendMessage(tabs[0].id, { click: "play" });
                });
            }).catch((e) => {
                displayMessage("something went wrong", e)
            })
            break
        case "next_snowball":
            StartSnowballState().then(() => {
                chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
                    chrome.tabs.sendMessage(tabs[0].id, { click: "play" }, response => {
                        if (chrome.runtime.lastError) {
                            displayMessage("Can't start scraping please refresh the page")
                        }
                    });
                })
            }).catch((e) => {
                displayMessage(e)
            })
            break
        default:
            console.warn("unimplemented event", request.event)
    }
});
