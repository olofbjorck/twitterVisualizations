/*******************************************************************************

(Goal: This visualisation is a graph of a Twitter Tree.) As of right now, it's
basically just a copy paste of Mike Bostocks force directed graph:

https://bl.ocks.org/mbostock/4062045

// TODO: Modify the code to work with twitter data.

*******************************************************************************/

/*
CREATE TEST DATA
*/
var graph =
{
	"nodes": [
		{"id": 1, "followers": 10, "group": 1},
    	{"id": 2, "followers": 20, "group": 1},
    	{"id": 3, "followers": 30, "group": 2,},
    	{"id": 4, "followers": 40, "group": 2,},
		{"id": 5, "followers": 50, "group": 3},
	],
	"links": [
    	{"source": 1, "target": 2, "weight": 1},
		{"source": 1, "target": 3, "weight": 1},
		{"source": 1, "target": 4, "weight": 1},
		{"source": 1, "target": 5, "weight": 1},
		{"source": 2, "target": 5, "weight": 1},
		{"source": 2, "target": 1, "weight": 3}
	]
};

// Specify file name
var filename = "vik_lundberg.csv";

// Specify display sizes
var margin = {
		top: 0.05 * window.innerHeight,
		right: 0.15 * window.innerHeight,
		bottom: 0.1 * window.innerHeight,
		left: 0.15 * window.innerHeight
	},
	width = window.innerWidth - margin.left - margin.right,
	height = window.innerHeight - margin.top - margin.bottom;

// Get div
var div = d3.select("#graphVisualizationDiv");

// Create svg
var svg = div.append('svg')
	.attr('width', width + margin.left + margin.right)
	.attr('height', height + margin.top + margin.bottom)
	.append("g")
		.attr("transform",
			"translate(" + margin.left + "," + margin.top + ")");

var color = d3.scaleOrdinal(d3.schemeCategory20);

var simulation = d3.forceSimulation()
    .force("link", d3.forceLink().id(function(d) { return d.id; }))
    .force("charge", d3.forceManyBody())
    .force("center", d3.forceCenter(width / 2, height / 2));

/*d3.json(data, function(error, graph) {
  if (error) throw error;*/

  var link = svg.append("g")
      .attr("class", "links")
    .selectAll("line")
    .data(graph.links)
    .enter().append("line")
      .attr("stroke-width", function(d) { return Math.sqrt(d.weight); });

  var node = svg.append("g")
      .attr("class", "nodes")
    .selectAll("circle")
    .data(graph.nodes)
    .enter().append("circle")
      .attr("r", 5)
      .attr("fill", function(d) { return color(d.group); })
      .call(d3.drag()
          .on("start", dragstarted)
          .on("drag", dragged)
          .on("end", dragended));

  node.append("title")
      .text(function(d) { return d.id; });

  simulation
      .nodes(graph.nodes)
      .on("tick", ticked);

  simulation.force("link")
      .links(graph.links);

  function ticked() {
    link
        .attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });

    node
        .attr("cx", function(d) { return d.x; })
        .attr("cy", function(d) { return d.y; });
  }
//});

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
