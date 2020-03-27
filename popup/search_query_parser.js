function parseSearchQuery(input) {
    if (!input) {
        return {
            'error': 'No input specified'
        }
    }
    let indexes = []
    let counter = -1;
    let openCounter = 0;
    let closeCounter = 0;
    let quoteCounter = 0;

    for (var i = 0; i < input.length; i++) {
        if (input.charAt(i) === '"') {
            quoteCounter++
        }
        if (input.charAt(i) === '(') {
            openCounter++
            counter = increaseCounter(indexes, counter)
            indexes[counter] = { 'start': i, children: [] }
        } else if (input.charAt(i) === ')') {
            indexes[counter].end = i
            indexes[counter].completed = true
            counter = decreaseCounter(indexes, counter)
            closeCounter++
        }
    }
    if (openCounter !== closeCounter) {
        return {
            'error': 'Search query incorrect the number of closing brackets is not equal to the number of opening brackets'
        }
    }
    if (quoteCounter % 2 !== 0) {
        return {
            'error': 'The number of quotes should be an even number'
        }
    }
    let arrangedIndexes = arrangeIndexes(indexes)
    createTreeForSupparts(input, arrangedIndexes)
    let replacements = []

    for (let j = 0; j < arrangedIndexes.length; j++) {
        let curIndex = arrangedIndexes[j]
        let part = input.substring(curIndex.start, curIndex.end + 1)
        replacements.push({
            'id': curIndex.start + ':' + curIndex.end,
            'part': part,
            'node': curIndex.node,
        })
    }
    for (let j = 0; j < arrangedIndexes.length; j++) {
        input = input.replace(replacements[j].part, replacements[j].id)
    }
    let toNodes = partToNodes(input)
    if (typeof toNodes == 'string') {
        toNodes = {
            "node": toNodes
        }
    }
    let resultingNode = replaceSubsWithNodes(toNodes, replacements)
    return {
        'tree': resultingNode,
    }
}

function createPlatformQueries(node, isRoot, platform) {
    let query = ''
    switch (platform) {
        case PlatformScholar:
            query = createPlatformQuery(node, isRoot, "", "", "(", ")");
            return 'https://scholar.google.com/scholar?q=' + encodeURI(query) + '&hl=en&as_sdt=0,5'
        case PlatformIEEE:
            query = createPlatformQuery(node, isRoot, '"All Metadata":', "", "(", ")")
            return 'https://ieeexplore.ieee.org/search/searchresult.jsp?action=search&newsearch=true&matchBoolean=true&queryText=' + encodeURI(query) + '&ranges=1872_2020_Year'
        case PlatformACM:
            query = createPlatformQuery(node, isRoot, "", "", "", "")
            return 'https://dl.acm.org/action/doSearch?AllField=' + encodeURI(query)
        case PlatformSpringer:
            query = createPlatformQuery(node, isRoot, "", "", "(", ")")
            return 'https://link.springer.com/search?query=' + encodeURI(query)
        case PlatformScienceDirect:
            query = createPlatformQuery(node, isRoot, "", "", "(", ")")
            return 'https://www.sciencedirect.com/search/advanced?qs=' + encodeURI(query)
        case PlatformWebOfScience:
            query = createPlatformQuery(node, isRoot, "", "", "(", ")")
            return query
        default:
            return ''
    }

}

function createPlatformQuery(node, isRoot, termPrefix, termSuffix, openingBracket, closingBracket) {
    let left = ""
    //Term
    if (typeof node.childLeft == 'string') {
        left = termPrefix + node.childLeft + termSuffix
    } else if (node.childLeft) {
        left = createPlatformQuery(node.childLeft, false, termPrefix, termSuffix, openingBracket, closingBracket)
    }
    let right = ""
    //Term
    if (typeof node.childRight == 'string') {
        right = termPrefix + node.childRight + termSuffix
    } else if (node.childRight) {
        right = createPlatformQuery(node.childRight, false, termPrefix, termSuffix, openingBracket, closingBracket)
    }
    let res = left + " " + node.node + " " + right
    if (!isRoot) {
        res = openingBracket + res.trim() + closingBracket
    }
    return res
}

function increaseCounter(indexes, counter) {
    counter++
    if (counter > indexes.length - 1) {
        return counter
    }
    for (let i = counter; counter < indexes.length; i++) {
        if (!indexes[i].completed) {
            return i + 1
        } else {
            counter++
        }
    }
    return counter
}

function decreaseCounter(indexes, counter) {
    counter--
    if (counter == 0) {
        return counter
    }
    if (counter > indexes.length) {
        counter = indexes.length - 1
    }
    for (let i = counter; counter >= 0; i--) {
        if (!indexes[i].completed) {
            return counter
        } else {
            counter--
        }
    }
    return 0
}

function createTreeForSupparts(input, indexes) {
    for (let i = 0; i < indexes.length; i++) {
        let curIndex = indexes[i]
        if (curIndex && curIndex.children && curIndex.children.length == 0) {
            let part = input.substring(curIndex.start + 1, curIndex.end)
            let toNodes = partToNodes(part)
            curIndex.node = toNodes
        } else {
            createTreeForSupparts(input, curIndex.children)
            let temp = input.substring(curIndex.start + 1, curIndex.end);
            let replacements = []
            for (let j = 0; j < curIndex.children.length; j++) {
                let curChild = curIndex.children[j]
                let part = input.substring(curChild.start, curChild.end + 1)
                replacements.push({
                    'id': curChild.start + ':' + curChild.end,
                    'part': part,
                    'node': curChild.node,
                })
            }
            for (let j = 0; j < curIndex.children.length; j++) {
                temp = temp.replace(replacements[j].part, replacements[j].id)
            }
            let toNodes = partToNodes(temp)
            curIndex.node = replaceSubsWithNodes(toNodes, replacements)
        }
    }
}

function replaceSubsWithNodes(node, replacements) {
    if (typeof node.childLeft == 'string') {
        for (let i = 0; i < replacements.length; i++) {
            if (node.childLeft == replacements[i].id) {
                node.childLeft = replacements[i].node
            }
        }
    } else if (node.childLeft) {
        node.childLeft = replaceSubsWithNodes(node.childLeft, replacements)
    }
    if (typeof node.childRight == 'string') {
        for (let i = 0; i < replacements.length; i++) {
            if (node.childRight == replacements[i].id) {
                node.childRight = replacements[i].node
            }
        }
    } else if (node.childRight) {
        node.childRight = replaceSubsWithNodes(node.childRight, replacements)
    }
    return node
}



function partToNodes(input) {
    let splittedOR = input.split(' OR ')
    if (splittedOR.length == 1) {
        let splittedAND = input.split(' AND ')
        if (splittedAND.length == 1) {
            return input
        }
        let leftChild = partToNodes(splittedAND[0])
        let rightChild = partToNodes(input.substring(splittedAND[0].length + 5, input.length))
        return {
            'node': 'AND',
            'childLeft': leftChild,
            'childRight': rightChild,
        }

    }
    let rightChild = partToNodes(input.substring(splittedOR[0].length + 4, input.length))
    let leftChild = partToNodes(splittedOR[0])
    return {
        'node': 'OR',
        'childLeft': leftChild,
        'childRight': rightChild,
    }

}

function arrangeIndexes(indexes) {
    let result = [];
    if (indexes.length == 0) {
        return result;
    }
    result.push(indexes[0])
    for (let i = 1; i < indexes.length; i++) {
        let added = false;
        for (let j = 0; j < result.length; j++) {
            let shouldAdd = shouldAddTo(result[j], indexes[i])
            if (shouldAdd) {
                let res = AddTo(result[j], indexes[i])
                result[j] = res.index
                added = true
            }
        }
        if (!added) {
            result.push(indexes[i])
        }
    }
    return result
}

function shouldAddTo(index, newUnit) {
    if (!newUnit) {
        return false
    }
    if (isChildOf(newUnit, index)) {
        return true
    }
    for (let i = 0; i < index.children.length; i++) {
        if (shouldAddTo(index.children[i], newUnit)) {
            return true
        }
    }
    return false
}

function AddTo(index, newUnit) {
    for (let i = 0; i < index.children.length; i++) {
        let res = AddTo(index.children[i], newUnit)
        if (res.added) {
            return {
                index: index,
                added: true
            }
        }
    }
    if (isChildOf(newUnit, index)) {
        index.children.push(newUnit)
        return {
            index: index,
            added: true,
        }
    }
    return {
        index: index,
        added: false,
    }
}

function isChildOf(index1, index2) {
    if (!index1) {
        return false
    }
    if (!index2) {
        return false;
    }
    return index1.start > index2.start && index1.end < index2.end
}