function signInAPI(basicAuth) {
    let headersIn = {
        'accept': 'application/json',
        'Authorization': basicAuth,
    }
    var request = $.ajax({
        url: window.backend_url + "/jwt/signin",
        method: "POST",
        headers: headersIn
    });

    request.done(function (data, textStatus, request) {
        if (request) {
            StoreJWT(request.getResponseHeader("Authorization"))
            setSignedIn()
            checkProject()
            ByID(document, "errMsg").innerHTML = "";
            displayMessage("Signed in successfully")

        } else {
            ByID(document, "errMsg").innerHTML = "Wrong user name and/or password.";
        }
    });

    request.fail(function (jqXHR, textStatus) {
        ByID(document, "errMsg").innerHTML = "Wrong user name and/or password.";
    });
}

function refreshJWT(bearer) {
    let headersIn = {
        'accept': 'application/json',
        'Authorization': bearer,
    }
    var request = $.ajax({
        url: window.backend_url + "/jwt/refresh",
        method: "GET",
        headers: headersIn
    });

    request.done(function (data, textStatus, request) {
        if (request) {
            StoreJWT(request.getResponseHeader("Authorization"))
        } else {
            console.warn("no JWT found in response")
        }
    });

    request.fail(function (jqXHR, textStatus) {
        console.log("Request failed", textStatus)

    });
}

function getLatestProject() {
    let bearer = localStorage.getItem('jwt')

    let headersIn = {
        'accept': 'application/json',
        'Authorization': bearer,
    }
    var request = $.ajax({
        url: window.backend_url + "/project/latest",
        method: "GET",
        headers: headersIn
    });

    request.done(function (data, textStatus, request) {
        if (data) {
            StoreCurrentProject(data)
        } else {
            console.warn("no JWT found in response")
        }
    });

    request.fail(function (jqXHR, textStatus) {
        console.log("Request failed", textStatus)

    });
}

function getProjectByID(projectID) {
    let bearer = localStorage.getItem('jwt')

    let headersIn = {
        'accept': 'application/json',
        'Authorization': bearer,
    }
    var request = $.ajax({
        url: window.backend_url + "/project/" + projectID,
        method: "GET",
        headers: headersIn
    });

    request.done(function (data, textStatus, request) {
        if (data) {
            StoreCurrentProject(data)
        } else {
            console.warn("no JWT found in response")
        }
    });

    request.fail(function (jqXHR, textStatus) {
        console.log("Request failed", textStatus)

    });
}


function listProjects() {
    let bearer = localStorage.getItem('jwt')

    let headersIn = {
        'accept': 'application/json',
        'Authorization': bearer,
    }
    var request = $.ajax({
        url: window.backend_url + "/project/list",
        method: "GET",
        headers: headersIn
    });

    request.done(function (data, textStatus, request) {
        if (data) {
            displayProjects(data)
        } else {
            console.warn("no JWT found in response")
        }
    });

    request.fail(function (jqXHR, textStatus) {
        console.log("Request failed", textStatus)

    });
}

function updateProject(body, projectID) {
    return new Promise((resolve, reject) => {

        let bearer = localStorage.getItem('jwt')
        let headersIn = {
            'accept': 'application/json',
            'Authorization': bearer,
        }
        var request = $.ajax({
            url: window.backend_url + "/project/" + projectID,
            method: "PUT",
            headers: headersIn,
            data: body,
        });

        request.done(function (data, textStatus, request) {
            if (data) {
                StoreCurrentProject(data)
                resolve(data)
            } else {
                reject("no data")
            }
        });

        request.fail(function (jqXHR, textStatus) {
            let info = ""
            if (jqXHR && jqXHR.responseText) {
                let responseText = JSON.parse(jqXHR.responseText)

                info = ": " + responseText.detail
            }
            console.log("Request failed", jqXHR)
            console.log("Request failed", textStatus)
            displayMessage("Could not update project" + info)
            reject("request failed")
        });
    });
}

function addProject(body) {
    let bearer = localStorage.getItem('jwt')

    let headersIn = {
        'accept': 'application/json',
        'Authorization': bearer,
    }
    var request = $.ajax({
        url: window.backend_url + "/project",
        method: "POST",
        headers: headersIn,
        data: body,
    });

    request.done(function (data, textStatus, request) {
        if (data) {
            StoreCurrentProject(data)
            displayMessage("Project added")
            clearFields()
        }
    });

    request.fail(function (jqXHR, textStatus) {
        console.log("Request failed", textStatus)
        displayMessage("Could not add project")
    });
}

function getArticleToSnowball(projectID) {
    return new Promise((resolve, reject) => {
        let bearer = localStorage.getItem('jwt')
        let headersIn = {
            'accept': 'application/json',
            'Authorization': bearer,
        }
        var request = $.ajax({
            url: window.backend_url + '/project/' + projectID + '/article/snowball',
            method: "GET",
            headers: headersIn,
        });

        request.done(function (data, textStatus, request) {
            if (data) {
                resolve(data)
            } else {
                reject("no data")
            }
        });

        request.fail(function (jqXHR, textStatus) {
            let info = ""
            if (jqXHR && jqXHR.responseText) {
                let responseText = JSON.parse(jqXHR.responseText)

                info = ": " + responseText.detail
            }
            console.log("Request failed", jqXHR)
            console.log("Request failed", textStatus)
            displayMessage("Could not update project" + info)
            reject("request failed")
        });
    });
}