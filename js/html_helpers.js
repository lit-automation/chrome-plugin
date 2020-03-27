function ByID(elem, id) {
    return elem.getElementById(id)
}

function ByClassName(elem, className) {
    return elem.getElementsByClassName(className)
}

function FirstElementByClassName(elem, className) {
    let elements = ByClassName(elem, className)
    if (elements.length == 0) {
        return null
    }
    return elements[0]
}

function FirstChild(elem) {
    let children = elem.childNodes
    if (children.length == 0) {
        return null
    }
    return children[0]
}