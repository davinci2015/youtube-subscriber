const {google} = require('googleapis')

const api = google.youtube('v3')

const subscribe = (channelId, client) => api.subscriptions.insert({
    auth: client,
    part: 'snippet',
    requestBody: {
        snippet: {
            resourceId: {
                kind: "youtube#channel",
                channelId
            }
        }
    }
})

const getChannelStatistics = (channelId, client) => new Promise((resolve, reject) => {
    api.channels.list({
        auth: client,
        part: 'statistics',
        fields: 'items(statistics/subscriberCount)',
        id: channelId
    }, (err, response) => {
        if (err) return reject(err)
        resolve(response.data.items[0].statistics)
    })
})

module.exports = {
    subscribe,
    getChannelStatistics
}