module.exports = {
    subscriberCountTarget: 100000,
    channelId: '',
    hostname: 'http://localhost:3000',
    port: 3000,
    interval: {
        min: 300, // 300ms
        max: 1000 * 60 * 60 // 1h
    },

    // https://console.cloud.google.com/apis/credentials
    keys: {
        client_secret: '',
        client_id: '',
        redirect_uris: ['http://localhost:3000/oauth2callback']
    }
}