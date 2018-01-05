let request = require('request');
let filter = require('array-filter');
let query = require('http-build-query');

const API_HOST = "https://api.utopian.io/api";
const ENDPOINT_MODERATORS = API_HOST + '/moderators';
const ENDPOINT_SPONSORS = API_HOST + '/sponsors';
const ENDPOINT_POSTS = API_HOST + '/posts';

let utopian = {};
utopian.getModerators = () => {
    return new Promise((yes, no) => {
        request(ENDPOINT_MODERATORS, [], (err, response, body) => {
            if (err) no(err);
            yes(body);
        })
    });
};
utopian.getSponsors = () => {
    return new Promise((yes, no) => {
        request(ENDPOINT_SPONSORS, [], (err, response, body) => {
            if (err) no(err);
            yes(body);
        })
    });
};
utopian.getSponsor = (username) => {
    return new Promise((yes, no) => {
        utopian.getModerators().then((moderators) => {
            yes(filter(JSON.parse(moderators).results, (moderator) => {
                if (moderator.account === username && moderator.banned === false && moderator.reviewed === true) {
                    return moderator
                } else {
                    return false;
                }
            }))
        });
    })
};
utopian.getSponsor = (username) => {
    return new Promise((yes, no) => {
        utopian.getSponsors().then((sponsors) => {
            yes(filter(JSON.parse(sponsors).results, (sponsor) => {
                if (sponsor.account === username) {
                    return sponsor
                } else {
                    return false;
                }
            }))
        });
    })
};

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
        request(ENDPOINT_POSTS + "?" + query(options), [], (err, response, body) => {
            if (err) no(err);
            yes(body);
        })
    });

};

utopian.getPendingPosts = (options) => {
  return new Promise((yes) => {
      utopian.getPosts(Object.assign(options, options)).then((posts) => {
          yes(posts);
      })
  })
};

utopian.getPendingPostsByModeratorAndCategory = (moderator, category, options) => {
  return new Promise((yes) => {
      utopian.getPosts(Object.assign({
          section: 'all',
          sortBy: 'created',
          filterBy: 'review',
          status: 'any',
          type: category
      }, options)).then((posts) => {
          yes(filter(JSON.parse(posts).results,(post) => {
              return post.moderator === moderator;
          }));
      })
  })
};

utopian.getPendingPostsCount = () => {
    return new Promise((yes, no) => {
        request(ENDPOINT_POSTS + "?" + query({filterBy: 'review', limit: 1, skip: 0}), [], (err, response, body) => {
            if (err) no(err);
            yes(JSON.parse(body).total);
        })
    });
};

utopian.getTotalPostCount = () => {
    return new Promise((yes, no) => {
        request(ENDPOINT_POSTS + "?" + query({limit: 1, skip: 0}), [], (err, response, body) => {
            if (err) no(err);
            yes(JSON.parse(body).total);
        })
    });
};


module.exports = utopian;