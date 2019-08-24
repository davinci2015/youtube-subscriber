const http = require('http')
const open = require('open')
const url = require('url')
const {google} = require('googleapis')

const configuration = require('./config')
const {subscribe, getChannelStatistics} = require('./youtube')

const authenticate = async (client, scopes) => new Promise((resolve, reject) => {
    http
        .createServer(async (req, res) => {
            try {
                if (req.url.indexOf('/oauth2callback') !== -1) {
                    const {tokens} = await client.getToken(new url.URL(req.url, configuration.hostname).searchParams.get('code'))
                    client.setCredentials(tokens)
                    res.end('Get back to the console.')
                    resolve()
                }
            } catch (e) {
                reject(e)
            }
        })
        .listen({port: configuration.port, hostname: configuration.hostname}, () => {
            open(client.generateAuthUrl({
                access_type: 'offline',
                scope: scopes.join(' '),
            }))
        })
})

const calculateInterval = subscriberCount => {
    let interval = configuration.interval.max

    const diff = Math.pow(configuration.targetSubscriberCount - subscriberCount, 2)

    if (diff < configuration.interval.max) {
        interval = diff
    }

    if (diff < configuration.interval.min) {
        interval = configuration.interval.min
    }

    return interval
}

const checkSubscriberCount = interval => async client => {
    setTimeout(async () => {
        try {
            const {subscriberCount} = await getChannelStatistics(configuration.channelId, client)
            if (Number(subscriberCount) > configuration.targetSubscriberCount) {
                console.log(`Current number of subscribers: ${subscriberCount}. Please update configuration parameters.`)
            } else if (Number(subscriberCount) === configuration.targetSubscriberCount - 1) {
                await subscribe(configuration.channelId, client)
                console.log('Subscribed!')
            } else {
                const interval = calculateInterval(subscriberCount)
                console.log(`${subscriberCount} ${new Date().toLocaleString()}`)
                console.log(`Next subscriber check in ${(interval / 1000).toFixed(2)} seconds\n`)
                checkSubscriberCount(interval)(client)
            }
        } catch (err) {
            console.log('The API returned an error:', err)
        }
    }, interval)
}

(async () => {
    const scopes = ['https://www.googleapis.com/auth/youtube']
    const oauth2Client = new google.auth.OAuth2(
        configuration.keys.client_id,
        configuration.keys.client_secret,
        configuration.keys.redirect_uris[0]
    )

    google.options({auth: oauth2Client})

    try {
        await authenticate(oauth2Client, scopes)
        checkSubscriberCount(configuration.interval.min)(oauth2Client)
    } catch (e) {
        console.log(e)
    }
})()