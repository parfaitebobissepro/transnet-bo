const mongoose = require('mongoose')

let homepageSchema = new mongoose.Schema({
    titre_bloc2: String,
    desc_bloc2: String,
    titre_bloc3: String,
    desc_bloc3: String,
    titre_bloc4: String,
    desc_bloc4: String,
    titre_bloc4_card1: String,
    titre_bloc4_card2: String,
    titre_bloc4_card3: String,
    desc_bloc4_card1: String,
    desc_bloc4_card2: String,
    desc_bloc4_card3: String,

    titre_bloc2_en: String,
    desc_bloc2_en: String,
    titre_bloc3_en: String,
    desc_bloc3_en: String,
    titre_bloc4_en: String,
    desc_bloc4_en: String,
    titre_bloc4_card1_en: String,
    titre_bloc4_card2_en: String,
    titre_bloc4_card3_en: String,
    desc_bloc4_card1_en: String,
    desc_bloc4_card2_en: String,
    desc_bloc4_card3_en: String,
},{timestamps:true})

module.exports = mongoose.model('Autresection', homepageSchema)