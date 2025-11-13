const JWT= require('jsonwebtoken');

const secret="hahaha@123";
// Authorization using token -json web token

function createTokenForUser(user){
    const payload={
        _id:user._id,
        email:user.email,
        profileimage:user.profileimage,
        role:user.role,
    };
    const token=JWT.sign(payload,secret);
    return token;
}

function validateToken(token){
    const payload=JWT.verify(token,secret);
    return payload;
}
module.exports={
    createTokenForUser,
    validateToken
}