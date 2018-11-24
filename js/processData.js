// Processes the commit history data
// https://developer.github.com/v3/repos/commits/#list-commits-on-a-repository
function getRepoCommits(callback) {
    $.get("https://api.github.com/repos/" + searchterm + "/" + repoterm + "/commits?per_page=1000",
        function (data, status) {
            console.log(status);
            callback(data, status);
        });
}

var filenamesDataset = [];
//var fileTarget = "";
var originals = [];
var numberOfBranches = 0;
// get the same files that different branches are working on
function getBranchesSameFiles() {
    getBranches(getWorkingFiles);
}

function getWorkingFiles(data) {
    var master = "master";
    if (data.length > 1) {
        for (i in data) {
            if (data[i].name !== master) {
                originals.push(data[i].name);
            }
        }
        numberOfBranches = originals.length;
        getFiles(getFilenames)
    } else {
        alert("no same working files");
    }
}

// TODO: rename it!!
function getFiles(callback) {
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

function updateChartForSameFiles(data) {
    var dataset = preProcessFileData(data);
    var branches = [];
    for (var i in data) {
        branches.push(Object.keys(data[i])[0]);
    }

    makeCircles(Object.keys(dataset), (chartWidth)/(Object.keys(dataset).length + 1), chartHeight/2);
    makeCircles(branches, (chartWidth)/(branches.length + 1), chartHeight * 3 /4);
    makeLines2(dataset);
}

function preProcessFileData(data) {
    var dataset = {};
    for (var i in data) {
        var arr = Object.values(data[i])[0];
        if (arr.length !== 0) {
            for (var j in arr) {
                var br = Object.keys(data[j])[0];
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

function makeLines2(dataset) {
    // var numberLines = dataset.length - 1;
    //
    // for (i = 1; i <= numberLines; i++) {
    //     svg.append("line")
    //         .style("stroke", "black")
    //         .attr("x1", i * distanceBetweenNodes)
    //         .attr("y1", middleGraph)
    //         .attr("x2", (i+1) * distanceBetweenNodes)
    //         .attr("y2", middleGraph);
    // }
    for (var i in dataset) {
        var x = i;
        var b = x;
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

// Where we identify what information we want to extract from API to later showCommits via D3
function processCommit(data) {
    var dataset = [];
    for (i in data) {
        dataset.push(data[i].sha);
        //[0] is latest commit
    }
    return dataset;
}

// Using processed commit data, show via D3
function showCommits(data, status) {
    console.log(status);
    console.log(data);
    $("#repoName").text(repoterm);
    var dataset = processCommit(data);
    updateChart(dataset);
}

// TODO - Do branch stuff later, first get live MASTER working
// Process branch data - TODO - all branches should have their commits checked real-time
// https://developer.github.com/v3/repos/branches/#list-branches
function getBranches(callback) {
    $.get("https://api.github.com/repos/" + searchterm + "/" + repoterm + "/branches",
        function (data, status) {
            console.log(status);
            callback(data, status);
        });
};

// TODO - callback function to process branches


//  TODO: D3 chart updating
function updateChart(dataset) {
    //find number of commits/circles to make
    var distanceBetweenNodes = (chartWidth)/(dataset.length + 1);
    var middleGraph = chartHeight/4;

    makeCircles(dataset, distanceBetweenNodes, middleGraph);
    makeLines(dataset, distanceBetweenNodes, middleGraph);
}

// Circles represent a commit
function makeCircles(dataset, distanceBetweenNodes, middleGraph) {
    var numberCommits = dataset.length;

    //TODO: Dynamically change the circle radius to a smaller/larger number for more/less commits,
    //TODO: Should be a max circle size so it doesn't look silly
    //TODO: Dynamically change the pulse size in accordance to circle radius
    for (i = 1; i <= numberCommits; i++) {
        svg.append("circle")
            .attr("id", dataset[i - 1])
            .attr("onclick", "testClick(this.id)")
            .attr("cx", i * distanceBetweenNodes)
            .attr("cy", middleGraph)
            .attr("r", 10);

        svg.append("circle")
            .attr("class", "pulseRing")
            .attr("fill", "none")
            .attr("stroke-width", 0.5)
            .attr("stroke", "black")
            .attr("cx", i * distanceBetweenNodes)
            .attr("cy", middleGraph)
            .attr("r", 5);
    }
    pulse();
}

// click on circle
function testClick(id) {
    alert(id);
}

// Lines represent the flow of commits, merges, etc
function makeLines(dataset, distanceBetweenNodes, middleGraph) {
    var numberLines = dataset.length - 1;

    for (i = 1; i <= numberLines; i++) {
        svg.append("line")
            .style("stroke", "black")
            .attr("x1", i * distanceBetweenNodes)
            .attr("y1", middleGraph)
            .attr("x2", (i+1) * distanceBetweenNodes)
            .attr("y2", middleGraph);
    }
}

// Pulses the commit circles
function pulse() {
    var circles = svg.selectAll(".pulseRing");
    (function repeat() {
        circles = circles.transition()
            .transition()
            .duration(2000)
            .attr('stroke-width', 0.01)
            .attr("stroke", "blue")
            .attr("r", 20)
            .transition()
            .duration(200)
            .attr("stroke-width", 0.5)
            .attr("stroke", "blue")
            .attr("r", 5)
            .on("end", repeat);
    })();
}