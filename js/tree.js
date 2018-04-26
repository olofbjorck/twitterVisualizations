/*******************************************************************************

This visualization is an overview of a Twitter network.

Contained in the visualisation is, for each user:

 - Number of retweets
 - Number of individual retweeters
 - Number of followers

*******************************************************************************/

// TODO: Set range on data input
// TODO: Add search option
// TODO: Fix Twitter timeline pop up on click

/*
Define our file name
*/
var filename = "twitter_network.csv";
var filepath = "../data/" + filename;

/*
Create accessors that specify data from the csv-file
*/
function x(d) { return d.NrOfRetweets; }
function y(d) { return d.NrOfRetweeters; }
function radius(d) { return d.followersCount; }
function color(d) { return d.followersCount; } // What to do here?
function name(d) { return d.ScreenName; }
function id(d) { return d.UserID; }

/*
Create our user of interest
*/
var userOfInterest = {
	UserID: "123456789", // Add the user of interest if wanted
}

/*
Create id-functions
*/
function getCircleId(d) { return "circ" + id(d); }
function getTextId(d) { return "text" + id(d); }

/*
Specify circle constants
*/
var circleMaxRadius = 5;
var circleMinRadius = 0;
var circleEnlargeConstant = 2;
var circleIdleOpacity = 0.2;
var circleActiveOpacity = 1;
var circleClickedStrokeWidth = 4;

/*
Create svg and specify display sizes
*/

// Specify display sizes
var margin = {
		top: 0.1 * window.innerHeight,
		right: 0.15 * window.innerHeight,
		bottom: 0.1 * window.innerHeight,
		left: 0.15 * window.innerHeight
	},
	width = window.innerWidth - margin.left - margin.right,
	height = window.innerHeight - margin.top - margin.bottom;

// Get div
var div = d3.select("#treeVisualizationDiv");

// Create svg
var svg = div.append('svg')
	.attr('width', width + margin.left + margin.right)
	.attr('height', height + margin.top + margin.bottom)
	.append("g").attr("id", "inner-space")
		.attr("transform",
			"translate(" + margin.left + "," + margin.top + ")");

/*
Create title
*/
var title = svg.append("text")
	.attr("class", "title") // style in css
	.attr("x", width / 2)
	.attr("y", 0)
	.text("Overview of Twitter network in " + filename);

/*
Create x-axis
*/

// Create x-scale
var xScale = d3.scaleLog()
	.range([0, width]);

// Create x-axis
var xAxis = d3.axisBottom(xScale)
	.ticks(5, d3.format(",d"))

// Create "g" for displaying of x-axis
var gXAxis = svg.append("g")
	.attr("class", "x axis")
	// Position at bottom
	.attr("transform", "translate(" + 0 + "," + height + ")")

// Create x-axis label.
var xAxisLabel = svg.append("text")
    .attr("class", "x label")
    .attr("text-anchor", "end")
    .attr("x", width)
    .attr("y", height - 6)
    .text("Number of retweets");

/*
Create y-axis
*/

// Create y-scale
var yScale = d3.scaleLinear()
	.range([height, 0]);

// Create y-axis
var yAxis = d3.axisLeft(yScale)

// Create "g" for displaying of y-axis
var gYAxis = svg.append("g")
	.attr("class", "y axis")

// Create y-axis label
var yAxisLabel = svg.append("text")
    .attr("class", "y label")
    .attr("text-anchor", "end")
    .attr("y", 6)
    .attr("dy", ".75em")
    .attr("transform", "rotate(-90)")
    .text("Number of unique retweeters");


/*
Create scale for radius
*/
var radiusScale = d3.scaleLog()
	.base(2)
	.range([circleMinRadius, circleMaxRadius])

/*
Create scale for color
*/
var colorScale = d3.scaleLinear()
	.range(["blue", "red"])

/*
Create zoom
*/
var zoom = d3.zoom()
	.scaleExtent([0.5, Infinity])
	.on("zoom", zoomed);

// Create zoomable area
var zoomView = svg.append("rect")
	.attr("class", "zoom")
  	.attr("width", width)
  	.attr("height", height)
	.call(zoom)
	.on("click", clickView)

// Add data. Each row represented as a "g" of class "node" inside the svg.
var data = d3.csv(filepath, function(error, data) {

	if (error) { console.log(error) }

	// TODO: Fix this. Should display based on data max/min
	xScale.domain([1, 10000])
	gXAxis.call(xAxis)
	yScale.domain([0, 350])
	gYAxis.call(yAxis)
	radiusScale.domain([1, 100000])
	colorScale.domain([1, 10000])

	// Enter the data
	var nodes = svg.append("g").selectAll("g")
		.data(data)
		.enter()

	// Create circles to display the data
	nodes.append("circle")
		.call(setCircleAttributes)
		.call(setCircleMouseEvents)
		.sort(orderLargestBelow)

	// Create tooltip that shows username
	nodes.append("text")
		.call(setTextAttributes)

	// Set appearance for user of interest
	d3.select("#" + getCircleId(userOfInterest))
		.attr("fill", "orange")

});

/**
 * Set attributes for circles (Twitter account nodes).
 */
function setCircleAttributes(circle) {
	circle
		.attr("class", "nodeCircle")
		.attr("data-id", id)
		.attr("id", getCircleId)
		.attr("opacity", circleIdleOpacity)
		.attr("fill", function(d) { return colorScale(color(d)); })
		.attr("stroke", "black")
		.attr("stroke-width", 0)
		.attr("r", function(d) { return radiusScale(radius(d)); })
		.attr("cx", function(d) { return xScale(x(d)); })
		.attr("cy", function(d) { return yScale(y(d)); })
}

/**
 * Set mouse events for circles.
 */
function setCircleMouseEvents(circle) {
	circle
		// Add tooltip and enlarge circle on mouse hover
		.on("mouseover", mouseoverCircle)
		// Remove tooltip and restore circle on mouseout
		.on("mouseout", mouseoutCircle)
		// Display timeline on click
		.on("click", clickCircle)
}

/**
 * Set attributes for tooltip (showing screen name) text.
 */
function setTextAttributes(text) {
	text
		.attr("class", "hidden nodeText") // Set class to hidden upon creation
		.attr("data-id", id)
		.attr("id", getTextId)
		.attr("x", function(d) { return xScale(x(d)); })
		.attr("y", function(d) { return yScale(y(d)); })
		.attr("dy", function(d) { return - (circleMaxRadius * circleEnlargeConstant * 1.5); })
		.attr("text-anchor", "beginning")
		.text(function(d) { return name(d); })
}

/**
 * Order so that largest circle gets placed deepest.
 */
function orderLargestBelow(a, b) {
	return radius(b) - radius(a);
}

/**
 * Handle mouse hover on circle. Display circle's screen name.
 */
function mouseoverCircle() {

	// Get circle
	var circle = d3.select(this);

	// Display activated circle
	circle.attr("r", circle.attr("r") * circleEnlargeConstant);
	circle.attr("opacity", circleActiveOpacity);

	// Set text class to visible
	svg.select("#text" + circle.attr("data-id"))
		.classed("hidden", false)
		.classed("visible", true)

}

/**
 * Handle zoom. Zoom both x-axis and y-axis.
 */
function mouseoutCircle() {

	// Get circle
	var circle = d3.select(this);

	// Display idle circle
	circle.attr("r", circle.attr("r") / circleEnlargeConstant);
	circle.attr("opacity", circleIdleOpacity);

	// Set text class to hidden
	svg.select("#text" + circle.attr("data-id"))
		.classed("visible", false)
		.classed("hidden", true)

}

/**
 * Handle zoom. Zoom both x-axis and y-axis.
 */
function zoomed() {

	// Create new x- and y-scale
	var new_xScale = d3.event.transform.rescaleX(xScale);
	var new_yScale = d3.event.transform.rescaleY(yScale);

	// Display new axes
  	gXAxis.call(xAxis.scale(new_xScale));
	gYAxis.call(yAxis.scale(new_yScale));

	// Reposition circles
  	d3.selectAll(".nodeCircle")
		.attr("cx", function(d) { return new_xScale(x(d)); })
		.attr("cy", function(d) { return new_yScale(y(d)); })

	// Reposition texts
  	d3.selectAll(".nodeText")
		.attr("x", function(d) { return new_xScale(x(d)); })
		.attr("y", function(d) { return new_yScale(y(d)); })

};

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
    		userId: id(d)
  		},
		document.getElementById("tweet"), // Tweet div
		{
    		height: height
  		}
	)
}
