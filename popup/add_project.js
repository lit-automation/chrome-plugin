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
    state.urls = []
    state.urls.push(ByID(document, "queryWebOfScienceNew").value)
    state.urls.push(ByID(document, "queryScienceDirectNew").value)
    state.urls.push(ByID(document, "querySpringerNew").value)
    state.urls.push(ByID(document, "queryScholarNew").value)
    state.urls.push(ByID(document, "queryIEEENew").value)
    state.urls.push(ByID(document, "queryACMNew").value)
    for (let i = state.processing_index; i < state.urls.length; i++) {
        if (state.urls[i] != "") {
            state.next_url = state.urls[i]
            state.processing_index = i
            break
        }
    }

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
    let clearField = ByID(document, "queryWebOfScienceNew")
    clearField.value = ""
    clearField = ByID(document, "queryScienceDirectNew")
    clearField.value = ""
    clearField = ByID(document, "querySpringerNew")
    clearField.value = ""
    clearField = ByID(document, "queryScholarNew")
    clearField.value = ""
    clearField = ByID(document, "queryIEEENew")
    clearField.value = ""
    clearField = ByID(document, "queryACMNew")
    clearField.value = ""
}