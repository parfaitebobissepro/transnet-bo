const mongoose = require('mongoose')
const passportLocalMongoose = require('passport-local-mongoose')
const {ObjectId} = mongoose.Schema.Types

let userSchema = new mongoose.Schema({
    name: String,
    username: { 
        type : String, 
        unique : true 
    },
    phone: String,
    email: { 
        type : String, 
        unique : true 
    },
    type: String,
    active: {
        type: Boolean,
        default: false
    },
    password: {
        type: String,
        select: false
    },
    pic: {
        type: String,
        default: "/images/default-pp.png"
    },
    approved: String,
    naissance: String,
    sexe: String,
    prenom: String,
    card_number: String,
    card_expiration: String,
    resetPasswordToken: String,
    resetPasswordExpires: Date
},{timestamps:true})

userSchema.plugin(passportLocalMongoose, {usernameField: 'email'})
module.exports = mongoose.model('User', userSchema)