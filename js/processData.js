// Processes the commit history data
// https://developer.github.com/v3/repos/commits/#list-commits-on-a-repository
function getRepoCommits(callback) {
    $.get("https://api.github.com/repos/" + searchterm + "/" + repoterm + "/commits",
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
    var reponame = "<h3>" + repoterm + "</h3>";
    $("#repoName").append(reponame);
    var dataset = processCommit(data);
    buildChart(data);
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

function buildChart(data) {
    // setup for the d3 chart
    // basic SVG setup
    var dataset = [];
    var margin = {top: 70, right: 20, bottom: 60, left: 100};
    var w = 600 - margin.left - margin.right;
    var h = 500 - margin.top - margin.bottom;

    //Create SVG element
    var svg = d3.select("div#chart")
        .append("svg")
        .attr("width", w + margin.left + margin.right)
        .attr("height", h + margin.top + margin.bottom);

    // define the x scale
    var xScale = d3.scale.ordinal()
        .domain(dataset.map(function (d) {
            return d.key;
        }))
        .rangeRoundBands([margin.left, w], 0.05);

    // define the x axis
    var xAxis = d3.svg.axis().scale(xScale).orient("bottom");

    // define the y scale
    var yScale = d3.scale.linear()
        .domain([0, d3.max(dataset, function (d) {
            return d.value;
        })])
        .range([h, margin.top]);

    // define the y axis
    var yAxis = d3.svg.axis().scale(yScale).orient("left");

    // draw the x axis
    svg.append("g")
        .attr("class", "xaxis")
        .attr("transform", "translate(0," + h + ")")
        .call(xAxis);

    // draw the y axis
    svg.append("g")
        .attr("class", "yaxis")
        .attr("transform", "translate(" + margin.left + ",0)")
        .call(yAxis);

    // add the x axis label
    svg.append("text")
        .attr("class", "x axis label")
        .attr("text-anchor", "middle")
        .attr("transform", "translate(" + (w / 2) + "," + (h + (margin.bottom / 2) + 10) + ")")
        .text("Language");

    // add the y axis label
    svg.append("text")
        .attr("class", "y axis label")
        .attr("text-anchor", "middle")
        .attr("transform", "translate(15," + (h / 2) + ")rotate(-90)")
        .text("Number of characters");


    // add a title to the chart
    svg.append("text")
        .attr("class", "chartTitle")
        .attr("text-anchor", "middle")
        .attr("transform", "translate(" + (w / 2) + ",20)")
        .text("GitHub Repo");
}