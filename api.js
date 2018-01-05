let request = require('request');
let filter = require('array-filter');

const API_HOST = "https://api.utopian.io/api";
const ENDPOINT_MODERATORS = API_HOST + '/moderators';

let utopian = {};
utopian.getModerators = () => {
    return new Promise((yes, no) => {
        request(ENDPOINT_MODERATORS, [], (err, response, body) => {
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


module.exports = utopian;