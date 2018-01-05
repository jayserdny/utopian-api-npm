let request = require('request');
let filter = require('array-filter');

const API_HOST = "https://api.utopian.io/api";
const ENDPOINT_MODERATORS = API_HOST + '/moderators';
const ENDPOINT_SPONSORS = API_HOST + '/sponsors';

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
utopian.isModerator = (username) => {
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
utopian.isSponsor = (username) => {
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

module.exports = utopian;