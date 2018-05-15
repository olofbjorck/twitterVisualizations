# Description

This is a webpage with visualizations of Twitter data using D3. The visualizations allows for exploratory data analysis of Twitter data. However, no data is provided by me - you have to collect it with your own Twitter credentials to comply with data protection laws and rules.

This is a part of my undergraduate project within [Project MEP](https://lamastex.github.io/scalable-data-science/sds/research/mep/).

# Get started

Requirements: [Node](https://nodejs.org/en/) to run the web server.

From the command line:


1. Download the repository:

    `
    $ git clone https://github.com/olofbjorck/twitterVisualizations.git
    `

2. Navigate to the files:

    `
    $ cd twitterVisualizations
    `

3. Start the web server (this is where Node is required):

    `
    $ node server.js
    `

4. Open the webpage in a browser: 
    
    http://localhost:8080/

    **Note:** I've only used and tested it in Chrome.
    
    
If that's working, we're set to add data. Change the dummy_data files to real data and change the filenames in the JavaScript files.


# Data format

Note that the code expects csv-files with column names generated from [Project MEP](https://lamastex.github.io/scalable-data-science/sds/research/mep/) code:


`userTimeline.csv`: 

| CurrentTweetDate | CurrentTwID | CurrentTweet | TweetType |
| --- | --- | --- | --- |


`tree.csv`:

| UserID | ScreenName | followersCount | NrOfRetweets | NrOfRetweeters |
| --- | --- | --- | --- | --- |

`links.csv`:

| source | target | weight | 
| --- | --- | --- |

`nodes.csv`: (group is not implemented and thus not really needed)

| id | idNr | weight | group | 
| --- | --- | --- | --- |


