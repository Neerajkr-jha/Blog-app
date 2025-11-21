const { validateToken } = require('../services/authorization');

// Authentication on token - cookie
function checkForAuthenticationCookie(cookieName) {
    return (req, res, next) => {
        const cookieTokenValue = req.cookies[cookieName];
        
        if (!cookieTokenValue) {
            return next(); 
        }
        
        try {
            const userPayload = validateToken(cookieTokenValue);
            req.user = userPayload;
           
            return next(); 
        } catch (error) {
           
            return next(); 
        }
    };
}

module.exports = {
    checkForAuthenticationCookie
};
