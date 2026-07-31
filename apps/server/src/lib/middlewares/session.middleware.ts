import session from 'express-session'

export default class SessionMiddleware {
    static get config() {
        return session({
            secret: 'randomstack-v0-session-secret',
            resave: false,
            saveUninitialized: true,
            cookie: {
                secure: false,
                maxAge: 24 * 60 * 60 * 1000
            }
        })
    }
}