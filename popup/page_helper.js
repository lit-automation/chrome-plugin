
function setSignedOut() {
    ByID(document, "signinContainer").style.display = "block";
    ByID(document, "normal").style.display = "none";
    removeActives()
    hideAllPages()
}

function setSignedIn() {
    ByID(document, "signinContainer").style.display = "none";
    ByID(document, "normal").style.display = "block";
    ByID(document, "home-page").style.display = "block";
    ByID(document, "home").classList.add("active-menu-item");
}

function menuClicked(page) {
    let state = GetState()
    if (state.status == Active) {
        displayMessage("Can't switch pages while scraping articles")
        return
    }
    hideAllPages()
    removeActives()
    switch (page) {
        case "home":
            ByID(document, "home-page").style.display = "block";
            ByID(document, "home").classList.add("active-menu-item");
            setCurProject()
            break
        case "settings":
            ByID(document, "settings-page").style.display = "block";
            ByID(document, "settings").classList.add("active-menu-item");
            setCurProject()
            break
        case "newproject":
            ByID(document, "new-project-page").style.display = "block";
            ByID(document, "newproject").classList.add("active-menu-item");
            break
        case "projects":
            listProjects()
            ByID(document, "projects-page").style.display = "block";
            ByID(document, "projects").classList.add("active-menu-item");
            setCurProject()
            break
    }
}

function removeActives() {
    ByID(document, "home").classList.remove("active-menu-item");
    ByID(document, "settings").classList.remove("active-menu-item");
    ByID(document, "projects").classList.remove("active-menu-item");
    ByID(document, "newproject").classList.remove("active-menu-item");
}

function hideAllPages() {
    ByID(document, "home-page").style.display = "none";
    ByID(document, "settings-page").style.display = "none";
    ByID(document, "projects-page").style.display = "none";
    ByID(document, "new-project-page").style.display = "none";
}

function setCurProject() {
    let curProject = GetCurrentProject()
    if (!curProject) {
        console.warn("No current project")
        return
    }
    let projectNameField = ByID(document, "projectName")
    projectNameField.value = curProject.name
    let searchQueryField = ByID(document, "searchQuery")
    searchQueryField.value = curProject.search_string
    let projectDisplayContainers = ByClassName(document, "cur-project-name")
    for (let i = 0; i < projectDisplayContainers.length; i++) {
        projectDisplayContainers[i].innerHTML = curProject.name
    }
    let projectStatusDisplayContainers = ByClassName(document, "cur-project-status")
    for (let i = 0; i < projectStatusDisplayContainers.length; i++) {
        projectStatusDisplayContainers[i].innerHTML = enums.ProjectStatus[curProject.status]
    }
    let projectArticleCountDisplayContainers = ByClassName(document, "cur-project-article-count")
    for (let i = 0; i < projectArticleCountDisplayContainers.length; i++) {
        projectArticleCountDisplayContainers[i].innerHTML = curProject.amount_of_articles
    }
    if(curProject.status > enums.ProjectStatusConductingSearch){
        ByID(document, "article-info-manager").style.display = "block";
        ByID(document, "scrape-manager").style.display = "none";
    }else{
        ByID(document, "article-info-manager").style.display = "none";
        ByID(document, "scrape-manager").style.display = "block";
    }
}