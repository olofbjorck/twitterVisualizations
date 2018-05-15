/*******************************************************************************

This user timeline visualisation let's you explore a Twitter users activity.

Contained in the visualisation is:

 - All Tweets in the data
 - A search function to search Tweets
 - A click option to view the original Tweet on Twitter

// TODO: 	Change csv to json. Tweets mess up when they contain a comma (,)
 			making them appear weird and not appear in search

*******************************************************************************/

// Specify file name.
var filename = "dummy_userTimeline.csv";
var filepath = "../data/" + filename;

// TODO: Create accessors that acces data in the csv-file instead of
// accessing csv-column names in the middle of the code

// Specify display sizes.
var margin = {
		top: 0.02 * window.innerHeight,
		right: 0.15 * window.innerHeight,
		bottom: 0.15 * window.innerHeight,
		left: 0.15 * window.innerHeight
	},
	width = window.innerWidth - margin.left - margin.right,
	height = window.innerHeight - margin.top - margin.bottom - 50; // Compensate for searchDiv

// Get div.
var div = d3.select("#userTimelineVisualizationDiv");

// Create svg.
var svg = div.append('svg')
	//.attr("class", "visualization")
	.style("z-index", "-1")
	.attr('width', width + margin.left + margin.right)
	.attr('height', height + margin.top + margin.bottom)
	.append("g")
		.attr("transform",
			"translate(" + margin.left + "," + margin.top + ")");

// Declare global searched string.
var searchedStr = "";

// Create zoom object. Zooms x-axis.
var zoom = d3.zoom()
	.on("zoom", zoomed);

// Create zoomable area. Basically just an overlaid rectangle.
var view = svg.append("rect")
	.attr("class", "zoom")
  	.attr("width", width)
  	.attr("height", height)
	// Allow for zoom while hovering x-axis
	.attr("transform",
		"translate(" + 0 + "," + margin.top + ")")
	// Remove currently displayed tweet on click
	.on("click", function() { clickView(); })
	// Link to zoom
	.call(zoom);

// Set various tweet radius
var idleTweetRadius = 15;
var activeTweetRadius = idleTweetRadius * 1.618;
var highlightedActiveTweetRadius = activeTweetRadius * 1.618;

// Add title to the figure.
svg.append("text")
	.attr("class", "title") // style in css
	.attr("x", width / 2)
	.attr("y", margin.top)
	.text("Tweets from " + filename);

// Create x-scale and set x-range.
var xScale = d3.scaleTime()
	.range([0, width]);

// Create xAxis.
var xAxis = d3.axisBottom(xScale)
	.tickFormat(d3.timeFormat("%c")); // Set tick format date and time


// Display x-axis.
var gXAxis = svg.append("g")
	.attr("class", "x axis")
	.attr("transform", "translate(" + 0 + "," + height + ")")

// Create x-axis label.
svg.append("text")
    .attr("class", "x label")
    .attr("text-anchor", "end")
    .attr("x", width)
    .attr("y", height - 6)
    .text("Time of Tweet");

// y-range. Sets data placement along y-axis.
// y-axis is divided in 6 lines, including top/bottom of chart,
// and data is placed in the middle, lines 2 to 5.
var yRange = [2, 3, 4, 5].map(function(x) { return x * height / 6; });

// y-domain. Specifies which data should be placed where along y-axis.
// Important: Matches with data from file.
var yDomain = ["ReplyTweet",
				"QuotedTweet",
				"ReTweet",
				"OriginalTweet"];

// y-ticks to be displayed.
var yTickValues = ["Reply",
					"Quote",
					"Retweet",
					"Tweet"];

// Create the y-scale and set y-range
var yScale = d3.scaleOrdinal()
	.range(yRange)
	.domain(yDomain);

// Create y-axis.
var yAxis = d3.axisLeft(yScale)
				.tickValues(yTickValues);

// Display y-axis (and label) after circles are placed to put y-axis above the circles

// Read data. Note: file needs to be chronologically structured so that
// data[0] is newest and data[length - 1] is oldest
var data = d3.csv(filepath, function(error, data) {

	if (error) throw error;

	// Create and display the x-axis
	createAndDisplayXAxis(data);

	// Create circle for each tweet
	svg.selectAll("g")
		.data(data)
		.enter().append("g").attr("id", function(d) {
											return getGID(d.CurrentTwID);
										})
			.append("circle")
				// Set class to tweet ID
				.attr("id", function(d) {
					return getTweetID(d.CurrentTwID);
				})
				// Set position
				.attr("cy", function(d) {
					return yScale(d.TweetType.replace(/\s/g,''));
				})
	    		.attr("cx", function(d) { // x-position by tweet date
					return xScale(new Date(d.CurrentTweetDate));
				})
				// Set circle radius
	    		.attr("r", idleTweetRadius)
				// Set stroke width to 0
				.attr("stroke-width", "0")
				// Set color by tweet type
				.attr("class", function(d) {
					// remove whitespace and return TweetType
					return "tweet " + d.TweetType.replace(/\s/g,'');
				})
				// Add tooltip and enlarge tweet on mouse hover
				.on("mouseover", mouseoverTweet)
				// Restore tweet on mouseout
				.on("mouseout", mouseoutTweet)
				// Show actual tweet on click
				.on("click", clickTweet)
	;

	// Display y-axis.
	var gYAxis = svg.append("g")
		.attr("class", "y axis") // Set class to y and axis
		.call(yAxis);

	// Create y-axis label.
	svg.append("text")
	    .attr("class", "y label")
	    .attr("text-anchor", "end")
		.attr("x", - 2 * height / 6)
	    .attr("y", 6)
	    .attr("dy", ".75em")
	    .attr("transform", "rotate(-90)")
	    .text("Type of Tweet");

	// display x-axis
	xAxis.ticks(5);
	gXAxis.call(xAxis);

	// Handle input search
	d3.select("#searchInput").on("input",
		function() {
			searchedStr = this.value.toLowerCase();
			searchTweets(data);
		});
});

/**
 * Searches all tweets for a specific string.
 *
 * @param {string} searchStr - The string to search for
 */
function searchTweets(data) {

	// Perform search if searched string is at least 3 chars long
	if (searchedStr.length > 2) {

		// Loop through all rows
		for (i = 0; i < data.length; i++) {

			// Get tweet text
			var tweetText = data[i].CurrentTweet;
			var tweet = d3.select("#" + getTweetID(data[i].CurrentTwID));

			// If tweet includes search string, display
			if (tweetText.toLowerCase().includes(searchedStr)) {
				// Set class to searched tweet and enlarge
				tweet
					.classed("searchedTweet", true)
					.attr("r", activeTweetRadius)
			// else, restore tweet to normal
			} else {
				tweet
					.classed("searchedTweet", false)
					.attr("r", idleTweetRadius)
			}
		}

		// Highlight the searched string
		highlight();

	// else, restore tweets and dehighlight
	} else {
		// Restore tweets
		d3.selectAll(".tweet")
			.classed("searchedTweet", false)
			.attr("r", idleTweetRadius)

		// Dehighlight the displayed tweet
		dehighlight();
	}
}

/**
 * Create and display x-axis based on newest
 * and oldest dates in the dataset. Also sets the x-scale domain.
 *
 * @param data - Twitter dataset
 */
function createAndDisplayXAxis(data) {

	// Get oldest date (that is, date of first tweet in the data)
	var oldestDate = new Date(data[data.length - 1].CurrentTweetDate);
	// Get newest date (that is, date of latest tweet in the data)
	var newestDate = new Date(data[0].CurrentTweetDate);
	// Add 2 weeks at beginning and end of axis for prettier display
	oldestDate.setDate(oldestDate.getDate() - 14); // go back 14 days
	newestDate.setDate(newestDate.getDate() + 14); // go forward 14 days

	// Set x-scale domain from newest and oldest date
	xScale.domain([oldestDate, newestDate]);
}

/**
 * Handle mouseover for Tweet.
 *
 * @param {list} d - Row from Twitter dataset
 */
function mouseoverTweet(d) {

	// Get tweet
	var tweet = d3.select(this)

	// Get tweet text div
	var tweetTextDiv = d3.select("#tweetTextDiv");

	// Remove old tweet
	tweetTextDiv.selectAll("span")
		.remove();

	// Display tweet text
	tweetTextDiv.append("span")
		.text(d.CurrentTweet);

	// Enlarge tweet
	tweet.attr("r", activeTweetRadius);

	// If the tweet is searched, highlight and enlarge it
	if (tweet.classed("searchedTweet")) {

		// Enlarge the tweet to active and highlighted
		tweet.attr("r", highlightedActiveTweetRadius);

		// Highlight the tweet
		highlight();

	// else (that is, tweet is not searched), just enlarge the tweet
	} else {

		// Enlarge tweet to active
		tweet.attr("r", activeTweetRadius);
	}
}

/**
 * Highlights the searched part of the tweet text.
 */
function highlight() {

	// Get tweet text div
	var tweetTextDiv = d3.select("#tweetTextDiv");

	// Get tweet text (works although text is inside a <span>)
	var tweetText = tweetTextDiv.text();
	// Get tweet text in lower case (used to highlight without case sensitivity)
	var tweetTextLowerCase = tweetText.toLowerCase();

	// Highlight if string to highlight is currently displayed
	if (tweetTextLowerCase.includes(searchedStr)) {

		// Get string before the string to highlight
		var strBefore = tweetText.substr(0, (tweetTextLowerCase.indexOf(searchedStr)));
		// Get string after the string to highlight
		var strAfter = tweetText.substr((tweetTextLowerCase.indexOf(searchedStr) +
									searchedStr.length),
									(tweetText.length - 1));

		// Remove non highlighted tweet text (the old tweet text with 1 <span>)
		tweetTextDiv.selectAll("span").remove();

		// Append string before highlight
		tweetTextDiv.append("span")
			.text(strBefore);
		// Append highlighted string
		tweetTextDiv.append("span")
			.attr("class", "highlight")
			.text(searchedStr);
		// Append string after highlight
		tweetTextDiv.append("span")
			.text(strAfter);
	}
}

/**
 * Dehighlights the tweet text.
 */
function dehighlight() {

	// Get tweet text div
	var tweetTextDiv = d3.select("#tweetTextDiv");

	// Get tweet text
	var tweetText = tweetTextDiv.text();

	// Remove highlighted text (the old tweet text with 3 <span>s)
	tweetTextDiv.selectAll("span").remove();

	// Add non highlighted text
	tweetTextDiv.append("span").text(tweetText);

	// Add actual tweet

}

/**
 * Handle mouseout for Tweet.
 * Removes the tooltip displaying the tweet.
 *
 * @param {list} d - Row from Twitter dataset
 */
function mouseoutTweet(d) {

	// Get tweet
	var tweet = d3.select(this)

	// Restore tweet to idle unless the tweet is searched
	if (!tweet.classed("searchedTweet")) {

		// Restore tweet
		tweet.attr("r", idleTweetRadius);

	// else (that is, tweet is searched), restore to active radius
	} else {
		// Restore tweet
		tweet.attr("r", activeTweetRadius);
	}
}

/**
 * Removes tooltip by ID.
 *
 * @param {string} id - The tooltip ID.
 */
function removeTooltip(id) {
	d3.select("#" + id).remove();
}

/**
 * Creates a tooltip ID from a raw data tweet ID.
 *
 * @param {string} id - The tweet ID.
 */
function getTooltipID(currentTwID) {
	return "tt" + currentTwID;
}

/**
 * Creates a tweet ID from a raw data tweet ID.
 *
 * @param {string} id - The tweet ID.
 */
function getTweetID(currentTwID) {
	return "tw" + currentTwID;
}

function getGID(currentTwID) {
	return "g" + currentTwID;
}

/**
 * Handle zoom: Zoom the x-axis.
 */
function zoomed() {

	// Create new x-scale based on zoom
	var new_xScale = d3.event.transform.rescaleX(xScale);

	// Display new x-scale. .ticks(3) to prettify
  	gXAxis.call(xAxis.ticks(5).scale(new_xScale));

	// Reposition tweets based on zoom
  	var tweets = d3.selectAll(".tweet");
	tweets.attr("cx", function(d) {
		return new_xScale(new Date(d.CurrentTweetDate));
	});
};

/**
 * Handle click on zoomable area. That is, handle click outside a tweet which
 * is considered a deselecting click. So, deselect previously clicked tweets
 * and remove displayed tweets.
 */
function clickView() {

	// Get all clicked tweets
	var clicked = d3.selectAll(".clicked");

	// Remove clicked status on clicked tweets
	clicked.attr("stroke-width", "0");
	clicked.classed("clicked", false);

	// Remove tweet
	document.getElementById("tweet").innerHTML = ""
}

/**
 * Handle click on a tweet circle. Display the clicked tweet and let the tweet
 * appear selected by adding a stroke to it.
 */
function clickTweet(d) {

	// Remove results from old click
	clickView();

	// Get tweet
	var tweet = d3.select(this)

	// Set tweet to clicked
	tweet.classed("clicked", true);

	// Get tweet div
	// Cannot do d3.select because twttr doesn't handle D3 selections
	var tweetDiv = document.getElementById("tweet");

	// Display tweet
    twttr.widgets.createTweet(d.CurrentTwID, tweetDiv)
}
