const mongoose = require('mongoose')

let homepageSchema = new mongoose.Schema({
    titre: String,
    image: String,
    desc: String,

    titre_en: String,
    desc_en: String,
},{timestamps:true})

module.exports = mongoose.model('Slide', homepageSchema)