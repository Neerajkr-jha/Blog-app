const { createHmac, randomBytes } = require('node:crypto')

const { Schema, model } = require('mongoose');
const { createTokenForUser } = require('../services/authorization');


//userschema ------
const userSchema = new Schema({
    fullname: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    salt: {
        type: String,
    },
    password: {
        type: String,
        required: true,
    },
    profileImage: {
        type: String,
        default: "/images/avatarpf.jpg",
    },
    role: {
        type: String,
        enum: ['USER'], 
        default: 'USER'
    }
},
    { timestamps: true }
);

// for hashing the password
userSchema.pre("save", function (next) {
    const user = this;

    if (!user.isModified("password")) {
        return;
    }

    const salt = randomBytes(16).toString('hex');
    const hashedPassword = createHmac("sha256", salt)
        .update(user.password)
        .digest('hex');

    this.salt = salt;
    this.password = hashedPassword;

    next();
})
// to verify hashed password by making the user entered password hased and verify with the password in DB

userSchema.static("matchPasswordAndGenerateToken", async function (email, password) {
    const user = await this.findOne({ email })
    if (!user) throw new Error('user not found');


    const salt = user.salt;
    const hashedPassword = user.password;

    const userProvidedHah = createHmac("sha256", salt)
        .update(password)
        .digest('hex');

    if (hashedPassword !== userProvidedHah) {
        throw new Error('Incorrect Password');
    }

    const token = createTokenForUser(user);
    return token;
});

const User = model('user', userSchema);


module.exports = User;