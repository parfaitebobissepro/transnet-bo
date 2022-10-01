const mongoose = require('mongoose')

let homepageSchema = new mongoose.Schema({
    type: String,
    image_partner: String,
},{timestamps:true})

module.exports = mongoose.model('Partner', homepageSchema)