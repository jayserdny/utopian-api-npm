const API_HOST = "https://api.utopian.io/api";
const ENDPOINT_MODERATORS = API_HOST + '/moderators';
const ENDPOINT_SPONSORS = API_HOST + '/sponsors';
const ENDPOINT_POSTS = API_HOST + '/posts';

const POST_TYPE_TRANSLATIONS = "translations";
const POST_TYPE_DEVELOPMENT = "development";
const POST_TYPE_BUGHUNTING = "bug-hunting";
const POST_TYPE_DOCUMENTATION = "documentation";

let utopian = {};

/**
 * @method encodeQueryData: Add parameter to a given url
 * @param {Object} parameters: Object of parameter
 * @returns encoded url with the parameters given.
 */
const encodeQueryData = function(parameters) {
    // temporary data holder
    let ret = [];
    for (let d in parameters)
      ret.push(encodeURIComponent(d) + '=' + encodeURIComponent(parameters[d]));
    return ret.join('&');
}

/**
 * @method requestURL: Fetch an API and returns its body
 * @param {string} url: String of the url to fetch
 * @returns A promise with the body of the response
 * @throws If promise is done but api returned error, reject the promise with the error. Otherwise, throw an error
 */
const requestURL = function(url) {
    // return new pending promise
    return new Promise((resolve, reject) => {
      // select http or https module, depending on reqested url
      const lib = url.startsWith('https') ? require('https') : require('http');
      const request = lib.get(url, (response) => {
        // handle http errors
        if (response.statusCode < 200 || response.statusCode > 299) {
           reject(new Error('Failed to load page, status code: ' + response.statusCode));
        }
        // temporary data holder
        const body = [];
        // on every content chunk, push it to the data array
        response.on('data', (chunk) => body.push(chunk));
        // we are done, resolve promise with those joined chunks
        response.on('end', () => resolve(body.join('')));
      });
      // handle connection errors of the request
      request.on('error', (err) => reject(err));
    }).catch((err) => {
        throw err;
    });
}

/**
 * @method getModerators: Return the moderators of Utopian
 * @returns Promise object array of utopian moderators
 */
utopian.getModerators = () => {
    return new Promise((yes, no) => {
        requestURL(ENDPOINT_MODERATORS).then((data) => {
            yes(JSON.parse(data));
        }).catch((err) => no(err));
    });
};

/**
 * @method getSponsors: Return the sponsors of Utopian
 * @returns Promise object array of utopian sponsors
 */
utopian.getSponsors = () => {
    return new Promise((yes, no) => {
        requestURL(ENDPOINT_SPONSORS).then((data) => {
            yes(JSON.parse(data));
        }).catch((err) => no(err));
    });
};

/**
 * @method getModerator: Return the return specific data from a moderator
 * @argument {string} username: username of the moderator
 * @returns Promise object array of utopian moderators
 */
utopian.getModerator = (username) => {
    return new Promise((yes, no) => {
        utopian.getModerators().then((moderators) => {
            moderators.results.filter((moderator) => {
                if (moderator.account === username && moderator.banned === false && moderator.reviewed === true) {
                    yes(moderator);
                }
            });
        }).catch((err) => no(err));
    })
};

/**
 * @method getSponsor: Return the return specific data from a Sponsor
 * @argument {string} username: username of the sponsor
 * @returns Promise object array of utopian sponsor
 */
utopian.getSponsor = (username) => {
    return new Promise((yes, no) => {
        utopian.getSponsors().then((sponsors) => {
            sponsors.results.filter((sponsor) => {
                if (sponsor.account === username) {
                    yes(sponsor);
                }
            });
        }).catch((err) => no(err));
    })
};

/**
 * @method getPosts: Return list of posts in a given query
 * @argument {Object}: query for the data
 * @returns Promise object array of posts
 */
utopian.getPosts = (options) => {

    if (!options) options = {};

    if (options.limit > 20 || options.limit < 1) {
        options.limit = 20;
    }

    if (options.length === 0) {
        options.limit = 20;
        options.skip = 0;
    }

    return new Promise((yes, no) => {
        requestURL(ENDPOINT_POSTS + '?' + encodeQueryData(options)).then((data) => {
            yes(JSON.parse(data));
        }).catch((err) => no(err));
    });

};

/**
 * @method getPendingPostsByModeratorAndCategory: Return list of pending posts by moderator and category in a given query
 * @argument {string} moderator: moderator to query
 * @argument {string} category: category to query
 * @argument {Options} options: query for the posts
 * @returns Promise object array of posts
 */
utopian.getPendingPostsByModeratorAndCategory = (moderator, category, options) => {
    return new Promise((yes) => {
        utopian.getPosts(Object.assign({
            section: 'all',
            sortBy: 'created',
            filterBy: 'review',
            status: 'any',
            type: category
        }, options)).then((posts) => {
            posts.results.filter((post) => {
                if (post.moderator === moderator) {
                    yes(post);
                }
            });
        }).catch((err) => no(err));
    })
};

/**
 * @method getPendingPostsByCategory: Return count of pending posts by a given category in a given query
 * @argument {string} category: category to query
 * @argument {Options} options: query for the posts
 * @returns Promise type number
 */
utopian.getPendingPostsByCategory = (category, options) => {
    return new Promise((yes) => {
        utopian.getPosts(Object.assign({
            sortBy: 'created',
            filterBy: 'review',
            type: category
        }, options)).then((posts) => {
            yes(posts.total);
        })
    })
};

/**
 * @method getPendingPosts: Return count of pending posts by a given query
 * @argument {Options} options: query for the posts
 * @returns Promise type number
 */
utopian.getPendingPosts = (options) => {
    return new Promise((yes) => {
        utopian.getPosts(Object.assign(
            {
                sortBy: 'created',
                filterBy: 'review'
            }, options
        )).then((posts) => {
            yes(posts.total);
        }).catch((err) => no(err));
    })
};

/**
 * @method getPendingPostsByModerator: Return list of the pending posts of the given moderator
 * @argument {string} moderator: moderator to query
 * @returns Promise object array of posts
 */
utopian.getPendingPostsByModerator = (moderator) => {
    return new Promise((yes) => {
        utopian.getPosts({
            section: 'all',
            sortBy: 'created',
            filterBy: 'review',
            status: 'pending',
            moderator: moderator,
            type: 'all'
        }).then((posts) => {
            yes(posts);
        }).catch((err) => no(err));
    })
};

/**
 * @method getPendingPostsCount: Return count of all pending posts
 * @returns Promise type number
 */
utopian.getPendingPostsCount = () => {
    return new Promise((yes, no) => {
        requestURL(ENDPOINT_POSTS + '?' + encodeQueryData({filterBy: 'review', limit: 1, skip: 0})).then((data) => {
            if (!data) no(false);
            else yes(JSON.parse(data).total);
        }).catch((err) => no(err));
    });
};

/**
 * @method getTotalPostCount: Return count of all posts
 * @returns Promise type number
 */
utopian.getTotalPostCount = () => {
    return new Promise((yes, no) => {
        requestURL(ENDPOINT_POSTS + '?' + encodeQueryData({limit: 1, skip: 0})).then((data) => {
            if (!data) no(false);
            else yes(JSON.parse(data).total);
        }).catch((err) => no(err));
    });
};

module.exports = utopian;