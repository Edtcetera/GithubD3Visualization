// Processes the commit history data
// https://developer.github.com/v3/repos/commits/#list-commits-on-a-repository
function getRepoCommits(callback) {
    $.get("https://api.github.com/repos/" + searchterm + "/" + repoterm + "/commits?per_page=1000",
        function (data, status) {
            console.log(status);
            callback(data, status);
        });
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
}

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
            .attr("r", 5);

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