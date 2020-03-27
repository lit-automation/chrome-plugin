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
    let nextURL = createPlatformQueries(parsingResult.tree, true, projectScrapingState.platforms[projectScrapingState.processing_index])
    projectScrapingState.next_url = nextURL
    updateProject({
        "name": projectNameField.value,
        "search_string": searchQueryField.value,
        "scrape_state": btoa(JSON.stringify(projectScrapingState)),
    }, curProject.id)
}
