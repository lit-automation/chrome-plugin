function displayProjects(data){
    let projList = ByID(document,"projectList")
    projList.innerHTML = ""
    for(let i = 0; i < data.length; i++){
        var node = document.createElement("div");  
        node.classList.add("row")
        node.classList.add("project-row")
        var projectNameContaianer = document.createElement("div");  
        projectNameContaianer.classList.add("projectNameContainer")

        projectNameContaianer.innerText = data[i].name;
        node.appendChild(projectNameContaianer)

        var projectSelectorContainer = document.createElement("div");  
        projectSelectorContainer.innerText = "Use";
        projectSelectorContainer.id = data[i].id;
        projectSelectorContainer.classList.add("project-selector")
        projectSelectorContainer.classList.add("button")
        projectSelectorContainer.classList.add("ml-auto")
        node.appendChild(projectSelectorContainer)

        projList.appendChild(node)
    }
    let elements = ByClassName(document,"project-selector")
    for(let i = 0; i < elements.length; i++){
        elements[i].addEventListener('click', () => {
            switchProject(elements[i].id)
        });
    }
}

function switchProject(id){
    displayMessage("Switched project")
    getProjectByID(id)
}