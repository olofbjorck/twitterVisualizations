/*******************************************************************************

This visualisation is a graph of a Twitter network.

*******************************************************************************/

var filepath_links = "../data/dummy_links.csv";
var filepath_nodes = "../data/dummy_nodes.csv";

var circleEnlargeConstant = 2;
var circleClickedStrokeWidth = 5;
var maxRadius = 10;

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
var svg = div.append("svg")
	.attr("class", "visualization")
	.attr("width", width + margin.left + margin.right)
	.attr("height", height + margin.top + margin.bottom)
	.append("g")
		.attr("transform",
			"translate(" + margin.left + "," + margin.top + ")");

// Create zoom
var zoom = d3.zoom()
    .on("zoom", zoomed);

// Create zoomable area
var zoomView = svg.append("rect")
	.attr("class", "zoom")
  	.attr("width", width)
  	.attr("height", height)
	.on("click", clickView)
	.call(zoom)

// Create color scale
//var color = d3.scaleOrdinal(d3.schemeCategory20);

// Create simulation
var simulation = d3.forceSimulation()
    //.force("link", d3.forceLink().id(function(d) { return d.id; }))
    .force("charge", d3.forceManyBody().strength(-10))
    .force("center", d3.forceCenter(width / 2, height / 2))

// Create loading text
var loading = svg.append("text")
    .attr("y", height / 2)
	.attr("x", width / 2)
    .attr("text-anchor", "middle")
    .text("Loading graph... \n Takes a couple of seconds");

// Read data
d3.csv(filepath_links, function(error, links) {
  if (error) throw error;
	d3.csv(filepath_nodes, function(error, nodes) {
		if (error) throw error;

			// Filter links
			var filteredLinks = links.filter(link => link.weight >= 15)

			// Create links
			var link = svg.append("g")
				.attr("class", "links")
			    .selectAll("line")
			    .data(links)
			    .enter().append("line")
			    	.attr("stroke-width", function(d) { return Math.sqrt(d.weight / 1000); });

			// Create nodes
			var node = svg.append("g")
				.attr("class", "nodes")
				.selectAll("circle")
			    .data(nodes)
			    .enter().append("circle")
					//.attr("fill", function(d) { return color(d.group); })
				   	.attr("r", function(d) { return Math.sqrt(d.weight / 100) + 2 })
					.on("mouseover", mouseoverCircle)
					.on("mouseout", mouseoutCircle)
					.on("click", clickCircle)
			    	.call(d3.drag()
			        	.on("start", dragstarted)
			        	.on("drag", dragged)
			        	.on("end", dragended));

			// Add title as child to circle
			node.append("title")
				.text(function(d) { return d.id; });

			// Link nodes and links to the simulation
			simulation
				.nodes(nodes)
				.on("tick", ticked)
				.force('link', d3.forceLink(filteredLinks).id(function(d) { return d.id; }));

			// Updates for each simulation tick
			function ticked() {
				link
					.attr("x1", function(d) { return d.source.x; })
					.attr("y1", function(d) { return d.source.y; })
					.attr("x2", function(d) { return d.target.x; })
					.attr("y2", function(d) { return d.target.y; });

				node
					.attr("cx", function(d) { return d.x; })
					.attr("cy", function(d) { return d.y; })
			}

			// Compute several steps before rendering
			loading.remove(); // Remove loading text
			for (var i = 0, n = 150; i < n; ++i) {
				simulation.tick();
			}

	});
});

/**
 * Handle mouse hover on circle. Enlarge circle.
 */
function mouseoverCircle() {

	// Get circle
	var circle = d3.select(this);

	// Display activated circle
	circle.attr("r", circle.attr("r") * circleEnlargeConstant);

}

/**
 * Handle mouse out on circle. Resize circle.
 */
function mouseoutCircle() {

	// Get circle
	var circle = d3.select(this);

	// Display idle circle
	circle.attr("r", circle.attr("r") / circleEnlargeConstant);

}

/**
 * Handle circle drag start.
 */
function dragstarted(d) {
	if (!d3.event.active) simulation.alphaTarget(0.3).restart();
	d.fx = d.x;
	d.fy = d.y;
}

/**
 * Handle circle drag.
 */
function dragged(d) {
	d.fx = d3.event.x;
	d.fy = d3.event.y;
}

/**
 * Handle circle drag end.
 */
function dragended(d) {
	if (!d3.event.active) simulation.alphaTarget(0);
	d.fx = null;
	d.fy = null;
}

/**
 * Handle zoom. Zoom both x-axis and y-axis.
 */
function zoomed() {
	d3.selectAll(".nodes").attr("transform", d3.event.transform)
	d3.selectAll(".links").attr("transform", d3.event.transform)
}

/**
 * Handle click on zoomable area. That is, handle click outside a node which
 * is considered a deselecting click => deselect previously clicked node
 * and remove displayed tweets.
 */
function clickView() {

	// Remove clicked status on clicked nodes
	d3.selectAll(".clicked")
		.attr("stroke-width", "0")
		.classed("clicked", false)

	// Remove timeline
	document.getElementById("tweet").innerHTML = ""
}

/**
 * Handle click on a tweet circle. Display the clicked tweet and let the tweet
 * appear selected by adding a stroke to it.
 */
function clickCircle(d) {

	// Remove results from old click
	clickView();

	// Add stroke width and set clicked class
	d3.select(this)
		.attr("stroke-width", circleClickedStrokeWidth)
		.classed("clicked", true);

	// Display tweet
    twttr.widgets.createTimeline(
		{
    		sourceType: "profile",
    		userId: d.idNr
  		},
		document.getElementById("tweet"), // Tweet div
		{
    		height: height
  		}
	)
}
