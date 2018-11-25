var branchesDataset;

function updateBranchDataset(data) {
    branchesDataset = [];
    for (var i in data) {
        var datum = data[i];
        var item = {};
        item[datum.sha] = [];
        if (datum.parents.length > 0) {
            for (var j in datum.parents)
                item[datum.sha].push(datum.parents[j].sha);
        }
        branchesDataset.push(item);
    }
}

function processBranchDataset() {
    var branchesNode = [];
    var branchesLink = [];
    for (var i in branchesDataset) {
        var sha = Object.keys(branchesDataset[i])[0];
        var item = {};
        item.id = sha;
        item.color = "black";
        branchesNode.push(item);
        var parents = branchesDataset[i][sha];
        if (parents.length > 0) {
            for (var j in parents) {
                var link = {};
                link.source = sha;
                link.target = parents[j];
                branchesLink.push(link);
            }
        }
    }
    return [branchesNode, branchesLink];
}
