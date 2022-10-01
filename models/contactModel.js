const mongoose = require('mongoose')

let contactSchema = new mongoose.Schema({
    name: String,
    subject: String,
    email: String,
    message: String,
    prenom: String,
    pays: String,
    tel: String,
    contact_wha: String
},{timestamps:true})

module.exports = mongoose.model('Contact', contactSchema)