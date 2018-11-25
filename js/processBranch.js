var filenamesDataset ;
//var fileTarget = "";
var originals;
var numberOfBranches;
var workingBranches;
var branchCommits = [];
var map = new Object;
//var map = new Hashmap();
// get the same files that different branches are working on
function getBranchesSameFiles() {
    filenamesDataset = [];
    originals = [];
    numberOfBranches = 0;
    workingBranches = [];
    $.get("https://api.github.com/repos/" + searchterm + "/" + repoterm + "/branches",
        function (data, status) {
            console.log(status);
            var master = "master";
            if (data.length > 1) {
                for (var i in data) {
                    if (data[i].name !== master) {
                        originals.push(data[i].name);
                        branchCommits.push(data[i]);

                                }
                }
                numberOfBranches = originals.length;
                getBranchFiles(getFilenames);
            } else {
                alert("The project has master branch only.");
            }
        });
}

function getCommitsPerBranch() {
    for (var i=0; i < branchCommits.length; i++){
        var name = branchCommits[i].name;
        var size = 0;
    $.get("https://api.github.com/repos/" + repoterm + "/commits?per_page=100&sha=" + branchCommits[i].sha,
    function (data, status) {
        console.log(status);
        size = data.length + 1;
        map[name]=size;

            });
    } }


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
    getCommitsPerBranch();
    // makeCircles(Object.keys(dataset), (chartWidth)/(Object.keys(dataset).length + 1), chartHeight/2);
    // makeCircles(branches, (chartWidth)/(branches.length + 1), chartHeight * 3 /4);
    // makeLines2(dataset);
    if (branches.length > 0) {
        var nodes_links = makeDataset(dataset, branches);
        drawGraph(nodes_links);
    } else {
        alert("All branches are merged!")
    }
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

function makeDataset(dataset, branches) {
    var nodes = [];
    var links = [];
    for (var i in branches) {
        var item = {};
        item.id = branches[i];
        item.color = "red";
        nodes.push(item);
    }
    for (var i in dataset) {
        var item = {};
        item.id = i;
        if (dataset[i].length > 1)
            item.color = "blue";
        else
            item.color = "green";
        nodes.push(item);
        for (var j in dataset[i]) {
            var link = {};
            link.source = i;
            link.target = dataset[i][j];
            links.push(link);
        }
    }
    return [nodes, links];
}

// var testWidth = +svg.attr("width");
// var testHeight = +svg.attr("height");




var simulation;

function drawGraph(dataset) {
    var node_data = dataset[0];
    var link_data = dataset[1];
    var radius = 5;


    simulation = d3.forceSimulation()
        .force("link", d3.forceLink().id(function(d){ return d.id;}).distance(80))
        .force("charge", d3.forceManyBody())
        .force("center", d3.forceCenter(chartWidth / 2, chartHeight / 2));


    var link = svg.append("g")
        .attr("class", "links")
        .selectAll("line")
        .data(link_data)
        .enter().append("line")
        .style("stroke", "black");

    var node = svg.append("g")
        .attr("class", "nodes")
        .selectAll("circle")
        .data(node_data)
        .enter().append("circle")
        .attr("id", function (d) { return d.id})
        .attr("r", function(d){return map[d.id];})
        .attr("fill", circleColor)
        .attr("onclick", "testClick(this.id)")
        .call(d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended));

    node.append("title")
        .text(function(d) { return d.id;});
    simulation
        .nodes(node_data)
        .on("tick", ticked);
    simulation.force("link")
        .links(link_data);


    function ticked() {
        link
            .attr("x1", function (d) { return d.source.x})
            .attr("y1", function (d) { return d.source.y})
            .attr("x2", function (d) { return d.target.x})
            .attr("y2", function (d) { return d.target.y});
        node
            .attr("cx", function (d) { return d.x = Math.max(radius, Math.min(chartWidth - radius, d.x))})
            .attr("cy", function (d) { return d.y = Math.max(radius, Math.min(chartHeight - radius, d.y))});
    }

    // TODO: OLD
    // var simulation = d3.forceSimulation().nodes(node_data);
    // simulation
    //     .force("charge_force", d3.forceManyBody())
    //     .force("center_force", d3.forceCenter(width/2, height/2));
    // var node = svg.append("g")
    //     .attr("class", "nodes")
    //     .selectAll("circle")
    //     .data(node_data)
    //     .enter()
    //     .append("circle")
    //     .attr("r", 5)
    //     .attr("fill", "red");
    //
    // simulation.on("tick", tickActions());
    // var link_force = d3.forceLink(link_data).id(function (d) {
    //     return d.name;
    // });
    // simulation.force("links", link_force);
    // var link = svg.append("g")
    //     .attr("class", "links")
    //     .selectAll("line")
    //     .data(link_data)
    //     .enter()
    //     .append("line")
    //     .attr("stroke-width", 2);
    //
    // function tickActions() {
    //     node
    //         .attr("cx", function (d) { return d.x})
    //         .attr("cy", function (d) { return d.y});
    //     link
    //         .attr("x1", function (d) { return d.source.x})
    //         .attr("y1", function (d) { return d.source.y})
    //         .attr("x2", function (d) { return d.target.x})
    //         .attr("y2", function (d) { return d.target.y});
    // }
}

function circleColor(d) {
    return d.color;
}

function dragstarted(d) {
    if (!d3.event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
}

function dragged(d) {
    d.fx = d3.event.x;
    d.fy = d3.event.y;
}

function dragended(d) {
    if (!d3.event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
}