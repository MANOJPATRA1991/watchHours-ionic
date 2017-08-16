module.exports = {
    'secretKey': '12345-67890-09876-54321',
    'mongoUrl': 'mongodb://MANOJ_PATRA:MAN#1991@ds145138.mlab.com:45138/watchours',
    'facebook': {
        //App ID
        clientID: '496648813792811',
        clientSecret: '291201a471d0ef0f4d0645f27ce8aa86',
        callbackURL: 'https://watch-hours.herokuapp.com/users/facebook/callback',
        profileFields: ['displayName', 'email', 'name'],
        passReqToCallback : true // allows us to pass in the req from our route (lets us check if a user is logged in or not)
    }
}