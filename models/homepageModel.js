const mongoose = require('mongoose')

let homepageSchema = new mongoose.Schema({
    title_avis: String,
    image_avis: String,
    message_avis: String,
    nom_avis: String,
    ville_pays_avis: String,

    title_avis_en: String,
    message_avis_en: String,
    nom_avis_en: String,
    ville_pays_avis_en: String
},{timestamps:true})

module.exports = mongoose.model('Homepage', homepageSchema)