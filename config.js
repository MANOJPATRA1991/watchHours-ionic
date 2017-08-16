module.exports = {
    'secretKey': '12345-67890-09876-54321',
    'mongoUrl': 'mongodb://MLABS_USER_ID:MLABS_USER_PASSWORD@ds145138.mlab.com:45138/watchours',
    'facebook': {
        //App ID
        clientID: 'FB_CLIENT_ID',
        clientSecret: 'FB_CLIENT_SECRET',
        callbackURL: 'http://localhost:8100/users/facebook/callback',
        profileFields: ['displayName', 'email', 'name'],
        passReqToCallback : true // allows us to pass in the req from our route (lets us check if a user is logged in or not)
    }
}