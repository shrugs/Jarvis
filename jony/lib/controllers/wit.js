var https = require('https');
var Future = require('futures').future;

var request_wit = function(user_text) {
    var future = Future.create();
    var options = {
        host: 'api.wit.ai',
        path: '/message?q=' + encodeURIComponent(user_text),
        //This is the Authorization header added to access your Wit account
        //This access token is protected for security reason,
        //in the demo this access token was equals to FSN2DG6YY64JD2T6WG5D6NVIXWU2F2QK
        //Make sure you replace it with your own or it won't work
        headers: {'Authorization': 'Bearer ' + process.env.ACCESS_TOKEN}
    };
    https.request(options, function(res) {
        var response = '';
        res.on('data', function (chunk) {response += chunk;});
        res.on('end', function () {
            future.fulfill(undefined, JSON.parse(response));
        });

    }).on('error', function(e) {
            future.fulfill(e, undefined);
        }).end();
    return future;
};

module.exports.request_wit = request_wit;