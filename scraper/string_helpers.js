String.prototype.clean = function () {
    //Remove enters
    let cleanupString = this.replace(/\n|\r/g, "")
    //Remove tabs
    cleanupString = cleanupString.replace(/\t/g, '');
    //Retrun the trimmed version
    return cleanupString.trim()
};