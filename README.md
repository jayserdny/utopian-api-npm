# utopian-api

This is the official npm package for the utopian api.

## Installation

To install this libary run: `npm i utopian-api --save`

## Methods

`getModerators()` : returns array of utopian moderators

`getSponsors()` : returns array of utopian sponsors

`getModerator(username)` : returns array with informations if username is an utopian moderator otherwise the array is empty

`getSponsor(username)` : returns array with informations if username is an utopian sponsor otherwise the array is empty

`getPosts(options)` : returns array of posts. Use options to apply filters.

`getPendingPosts()` : alias to get pending posts

`getPendingPostsByModeratorAndCategory(moderator, category)` : alias to get pending posts for the given moderator in the given category

`getPendingPostsByModerator(moderator)` : alias to get pending posts for the given moderator

`getPendingPostsCount()` : get total pending posts count

`getTotalPostCount()` : get total posts count


## Examples

*Get all moderators and log their names:*

````js
let utopian = require('utopian-api');

utopian.getModerators().then((moderators) => {
    for (i = 0; i < moderators.results.length; i++) {
        console.log(moderators.results[i].account)
    }
});
````
*Get all sponsors and log their names:*

````js
let utopian = require('utopian-api');

utopian.getSponsors().then((sponsors) => {
    for (i = 0; i < sponsors.results.length; i++) {
        console.log(sponsors.results[i].account)
    }
});
````

*Check wether a user is a utopian.io mod:*

````js
let utopian = require('./api');
utopian.getModerator("wehmoen").then((result) => {
    console.log(result);
}); // returns [{_id: '5a4bf....}]
utopian.getModerator("ned").then((result) => {
    console.log(result);
}); //returns []
````

## Contribution

If you want to contribute to this package create a fork, make your changes and create a pull request.



