const messageBody = {
    "username": "Error notifier", // This will appear as user name who posts the message
    "text": "User failed to login 3 times. Account locked for 15 minutes.", // text
    "icon_emoji": ":bangbang:", // User icon, you can also use custom icons here
    "attachments": [{ // this defines the attachment block, allows for better layout usage
        "color": "#eed140", // color of the attachments sidebar.
        "fields": [ // actual fields
            {
                "title": "Environment", // Custom field
                "value": "Production", // Custom value
                "short": true // long fields will be full width
            },
            {
                "title": "User ID",
                "value": "331",
                "short": true
            }
        ]
    }]
};


const https = require('https');

const yourWebHookURL = ''; // PUT YOUR WEBHOOK URL HERE



/**
 * Handles the actual sending request. 
 * We're turning the https.request into a promise here for convenience
 * @param webhookURL
 * @param messageBody
 * @return {Promise}
 */
exports.sendSlackMessage = (webhookURL, messageBody) => {
    // make sure the incoming message body can be parsed into valid JSON
    try {
        messageBody = JSON.stringify(messageBody);
    } catch (e) {
        throw new Error('Failed to stringify messageBody', e);
    }

    // Promisify the https.request
    return new Promise((resolve, reject) => {
        // general request options, we defined that it's a POST request and content is JSON
        const requestOptions = {
            method: 'POST',
            header: {
                'Content-Type': 'application/json'
            }
        };

        // actual request
        const req = https.request(webhookURL, requestOptions, (res) => {
            let response = '';


            res.on('data', (d) => {
                response += d;
            });

            // response finished, resolve the promise with data
            res.on('end', () => {
                resolve(response);
            })
        });

        // there was an error, reject the promise
        req.on('error', (e) => {
            reject(e);
        });

        // send our message body (was parsed to JSON beforehand)
        req.write(messageBody);
        req.end();
    });
}
