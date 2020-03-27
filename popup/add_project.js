function addProjectFromForm() {
    let curProject = GetCurrentProject()
    let projectNameField = ByID(document, "projectNameNew")

    let searchQueryField = ByID(document, "searchQueryNew")
    let parsingResult = parseSearchQuery(searchQueryField.value);
    if (parsingResult.error) {
        displayMessage(parsingResult.error)
        return;
    }
    let state = defaultState;
    let nextURL = createPlatformQueries(parsingResult.tree, true, state.platforms[state.processing_index])
    state.next_url = nextURL
    addProject({
        "name": projectNameField.value,
        "search_string": searchQueryField.value,
        "scrape_state": btoa(JSON.stringify(state)),
    })
}

function clearFields() {
    let projectNameField = ByID(document, "projectNameNew")
    projectNameField.value = ""

    let searchQueryField = ByID(document, "searchQueryNew")
    searchQueryField.value = ""
}