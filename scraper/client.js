
function createArticle(payload) {
    let bearer = GetJWT()

    let projectID = GetProjectID()

    let headersIn = {
        'accept': 'application/json',
        'Authorization': bearer
    }
    var request = $.ajax({
        url: window.backend_url + "/project/" + projectID + "/article",
        method: "POST",
        dataType: "json",
        data: payload,
        headers: headersIn
    });

    request.done(function (msg) {
    });

    request.fail(function (jqXHR, textStatus) {
        console.log("Request failed", textStatus)
    });
}

function updateArticle(payload, articleID, projectID) {
    let bearer = GetJWT()

    let headersIn = {
        'accept': 'application/json',
        'Authorization': bearer
    }
    var request = $.ajax({
        url: window.backend_url + "/project/" + projectID + "/article/" + articleID,
        method: "PUT",
        dataType: "json",
        data: payload,
        headers: headersIn
    });

    request.done(function (msg) {
    });

    request.fail(function (jqXHR, textStatus) {
        console.log("Request failed", textStatus)
    });
}

