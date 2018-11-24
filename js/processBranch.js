var filenamesDataset = [];
//var fileTarget = "";
var originals = [];
var numberOfBranches = 0;
var workingBranches = [];
// get the same files that different branches are working on
function getBranchesSameFiles() {
    $.get("https://api.github.com/repos/" + searchterm + "/" + repoterm + "/branches",
        function (data, status) {
            console.log(status);
            var master = "master";
            if (data.length > 1) {
                for (var i in data) {
                    if (data[i].name !== master) {
                        originals.push(data[i].name);
                    }
                }
                numberOfBranches = originals.length;
                getBranchFiles(getFilenames);
            } else {
                alert("no same working files");
            }
        });
}

//
// function getWorkingBranches(data) {
//     var master = "master";
//     if (data.length > 1) {
//         for (var i in data) {
//             if (data[i].name !== master) {
//                 originals.push(data[i].name);
//             }
//         }
//         numberOfBranches = originals.length;
//         getBranchFiles(getFilenames)
//     } else {
//         alert("no same working files");
//     }
// }

// store filenames and branch as object {branch:[filenames]}
function getFilenames(data) {
    var filenames = [];
    if (data.files.length > 0) {
        for (i in data.files)
            filenames.push(data.files[i].filename);
    }
    var toAdd = {};
    var target = data.url.split("...")[1];
    toAdd[target] = filenames;
    filenamesDataset.push(toAdd);
}

// get the files that each branches are working on
function getBranchFiles(callback) {
    while (originals.length > 0) {
        $.get("https://api.github.com/repos/" + searchterm + "/" + repoterm + "/compare/master..." + originals.pop(),
            function (data, status) {
                console.log(status);
                // console.log(data);
                callback(data);
                if (filenamesDataset.length === numberOfBranches) {
                    updateChartForSameFiles(filenamesDataset);
                }
            });
    }
}

// update the chart to display working files
function updateChartForSameFiles(data) {
    var dataset = preProcessFileData(data);
    var branches = workingBranches;
    // for (var i in data) {
    //     branches.push(Object.keys(data[i])[0]);
    // }

    makeCircles(Object.keys(dataset), (chartWidth)/(Object.keys(dataset).length + 1), chartHeight/2);
    makeCircles(branches, (chartWidth)/(branches.length + 1), chartHeight * 3 /4);
    makeLines2(dataset);
}

// data as [{branch: [filenames]}, {...}] to dataset as {filenameA: [branches], filenameB: [branches], ...}
function preProcessFileData(data) {
    var dataset = {};
    for (var i in data) {
        var arr = Object.values(data[i])[0];
        var br = Object.keys(data[i])[0];
        if (arr.length !== 0) {
            workingBranches.push(br);
            for (var j in arr) {
                var aFile = arr[j];
                if (Object.keys(dataset).indexOf(aFile) > -1) {
                    dataset[aFile].push(br);
                } else {
                    dataset[aFile] = [];
                    dataset[aFile].push(br);
                }
            }
        }
    }
    return dataset;
}

// Lines to connect branch and files
function makeLines2(dataset) {
    for (var i in dataset) {
        var branches = dataset[i];
        var file_cx = Number(document.getElementById(i).getAttribute("cx"));
        var file_cy = Number(document.getElementById(i).getAttribute("cy"));
        for (var j in branches) {
            var br = branches[j];
            var br_cx = Number(document.getElementById(br).getAttribute("cx"));
            var br_cy = Number(document.getElementById(br).getAttribute("cy"));
            svg.append("line")
                .style("stroke", "black")
                .attr("x1", file_cx)
                .attr("y1", file_cy)
                .attr("x2", br_cx)
                .attr("y2", br_cy);
        }
    }
}

// function drawGraph(dataset) {
//     var node_data = [];
//     var simulation = d3.forceSimulation().nodes(node_data);
//     simulation
//         .force("charge_")
// }