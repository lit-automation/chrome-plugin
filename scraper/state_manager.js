const Active = "active";
const SnowballStatus = "snowball";
const Paused = "paused";

const PlatformScholar = 1;
const PlatformACM = 2;
const PlatformSpringer = 3;
const PlatformIEEE = 4;
const PlatformWebOfScience = 5;
const PlatformScienceDirect = 6;

let defaultState = {
    "status": Paused,
    "platforms": [PlatformWebOfScience,PlatformScienceDirect, PlatformSpringer, PlatformScholar, PlatformIEEE, PlatformACM],
    "processing_index": 0,
    "platform_counter": 0,
    "next_url": "",
}

function StoreScrapingStatus(scrapingStatus) {
    localStorage.setItem('scraping_status', scrapingStatus)
}

function GetScrapingStatus() {
    let status = localStorage.getItem('scraping_status')
    if (!status) {
        return Paused
    }
    return status
}

function LogState() {
    console.log(GetState())
}

function GetState() {
    let state = JSON.parse(localStorage.getItem('state'));
    if (state == null) {
        StoreState(defaultState)
        state = defaultState
    }
    return state
}

function StoreState(state) {
    localStorage.setItem('state', JSON.stringify(state))
}

function SetNextURL(url) {
    let state = GetState()
    state.next_url = url
    StoreState(state)
    return state
}

function GetCurrentNextURL() {
    let state = GetState()
    return state.next_url
}

function GetProjectID() {
    let state = GetState()
    return state.project_id
}

function GetCurrentPlatform() {
    let state = GetState()
    return state.platforms[state.processing_index]
}

function IncreasePlatformIndex() {
    let state = GetState()
    if (state.platforms.length == state.processing_index + 1) {
        return
    }
    state.processing_index++
    StoreState(state)
    return state.platforms[state.processing_index]
}

function GetPlatformCounter() {
    let state = GetState()
    return state.platform_counter
}

function IncreasePlatformCounter() {
    let state = GetState()
    state.platform_counter++
    StoreState(state)
    return state
}

function StoreJWT(jwt) {
    localStorage.setItem('jwt', jwt)
}

function GetJWT() {
    return localStorage.getItem('jwt')
}
