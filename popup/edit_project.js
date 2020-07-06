function editProject() {
    let curProject = GetCurrentProject()
    let projectNameField = ByID(document, "projectName")

    let searchQueryField = ByID(document, "searchQuery")
    let parsingResult = parseSearchQuery(searchQueryField.value);
    if (parsingResult.error) {
        displayMessage(parsingResult.error)
        return;
    }
    let projectScrapingState = JSON.parse(atob(curProject.scrape_state))
    projectScrapingState.urls = []
    projectScrapingState.urls.push(ByID(document, "queryWebOfScience").value)
    projectScrapingState.urls.push(ByID(document, "queryScienceDirect").value)
    projectScrapingState.urls.push(ByID(document, "querySpringer").value)
    projectScrapingState.urls.push(ByID(document, "queryScholar").value)
    projectScrapingState.urls.push(ByID(document, "queryIEEE").value)
    projectScrapingState.urls.push(ByID(document, "queryACM").value)
    for (let i = projectScrapingState.processing_index; i < projectScrapingState.urls.length; i++) {
        if (projectScrapingState.urls[i] != "") {
            projectScrapingState.next_url = projectScrapingState.urls[i]
            projectScrapingState.processing_index = i
            break
        }
    }
    updateProject({
        "name": projectNameField.value,
        "search_string": searchQueryField.value,
        "scrape_state": btoa(JSON.stringify(projectScrapingState)),
    }, curProject.id)
}
