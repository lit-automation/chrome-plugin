function StoreJWT(jwt) {
    localStorage.setItem('jwt', jwt)
}

function GetJWT() {
    return localStorage.getItem('jwt')
}

function IsSignedIn() {
    let bearer = localStorage.getItem('jwt')
    if (bearer) {
        let jwt = parseJwt(bearer)
        if (isJWTExpired(jwt)) {
            return false
        }
        if (shouldRefreshJWT(jwt)) {
            refreshJWT(bearer)
        }
        return true
    }
    return false
}

function SignOut() {
    localStorage.clear();
}

function parseJwt(token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
}

function isJWTExpired(jwt) {
    return new Date() > getExpiresFromJWT(jwt.exp)
}

function getExpiresFromJWT(unix_timestamp) {
    return new Date(unix_timestamp * 1000);
}

function shouldRefreshJWT(jwt) {
    return new Date() > new Date(getExpiresFromJWT(jwt.exp) + 12096e5);
}

function checkProject() {
    let project = GetCurrentProject()
    if (project == null) {
        getLatestProject()
    } else {
        getProjectByID(project.id)
    }
}

function GetCurrentProject() {
    return JSON.parse(localStorage.getItem('current_project'));
}

function StoreCurrentProject(project) {
    localStorage.setItem('current_project', JSON.stringify(project))
    setCurProject()
}

// Scraping state handlers
const Active = "active";
const Snowball = "snowball";
const Paused = "paused";

const PlatformScholar = 1;
const PlatformACM = 2;
const PlatformSpringer = 3;
const PlatformIEEE = 4;
const PlatformWebOfScience = 5;
const PlatformScienceDirect = 6;

let defaultState = {
    "status": Paused,
    "platforms": [PlatformWebOfScience, PlatformScienceDirect, PlatformSpringer, PlatformScholar, PlatformIEEE, PlatformACM],
    "urls": [],
    "processing_index": 0,
    "platform_counter": 0,
    "next_url": "",
    "snowball": {
        "title":"",
        "id":""
    },
}

function LogState() {
    console.log(GetState())
}

function GetState() {
    let curProject = GetCurrentProject()
    let projectScrapingState = JSON.parse(atob(curProject.scrape_state))
    projectScrapingState.project_id = curProject.id
    return projectScrapingState
}

function SetDefaultState() {
    StoreState(defaultState)
}

function IsStateFinished(state){
    if (!state.platforms[state.processing_index + 1] && (!state.next_url || state.next_url == '')){
        return enums.ProjectStatusArticlesGathered
    }else{
        return enums.ProjectStatusConductingSearch
    }
}

function StoreStateFromInsert(state, increasePlatformCounter) {
    return new Promise((resolve, reject) => {
        let curProject = GetCurrentProject()
        let currentState = btoa(JSON.stringify(curProject.scrape_state))
        if (currentState.status == Paused) {
            state.status = Paused;
        }
        if (increasePlatformCounter || !state.next_url) {
            if (state.platforms[state.processing_index + 1]) {
                state.processing_index++
                state.platform_counter = 0;
                let isSet = false
                for (let i = state.processing_index; i < state.urls.length; i++) {
                    if (state.urls[i] != "") {
                        state.next_url = state.urls[i]
                        state.processing_index = i
                        isSet = true
                        break
                    }
                }
                if(!isSet){
                    state.status = Paused;
                    displayMessage("Done scraping")
                }
            } else {
                state.status = Paused;
                displayMessage("Done scraping")
            }
        }
        curProject.scrape_state = btoa(JSON.stringify(state))
        updateProject({
            "scrape_state": curProject.scrape_state,
            "status": IsStateFinished(state)
        }, curProject.id).then((res) => {
            resolve(res)
        }).catch((e) => {
            reject(e)
        })
    })
}

function StoreState(state) {
    let curProject = GetCurrentProject()
    curProject.scrape_state = btoa(unescape(encodeURIComponent(JSON.stringify(state))))
    StoreCurrentProject(curProject)
}

function PauseState() {
    return new Promise((resolve, reject) => {
        let state = GetState()
        state.status = Paused
        StoreState(state)
        updateProject({
            "scrape_state": btoa(JSON.stringify(state)),
        }, state.project_id).then((res) => {
            resolve(res)
        }).catch((e) => {
            reject(e)
        })
    })
}

function StartSnowballState() {
    return new Promise((resolve, reject) => {
        let state = GetState()
        state.status = Snowball
        StoreState(state)
        getArticleToSnowball(state.project_id).then((res)=>{
            let state = GetState()
            if(!state.snowball){
                state.snowball = {}
            }
            state.snowball.title = res.title
            state.snowball.id = res.id
            StoreState(state)
            resolve(res)
        }).catch((e)=>{
            reject(e)
        })
    })
}

function StartState() {
    return new Promise((resolve, reject) => {
        let state = GetState()
        state.status = Active
        StoreState(state)
        updateProject({
            "status": enums.ProjectStatusConductingSearch,
            "scrape_state": btoa(JSON.stringify(state)),
        }, state.project_id).then((res) => {
            resolve(res)
        }).catch((e) => {
            reject(e)
        })
    })
}