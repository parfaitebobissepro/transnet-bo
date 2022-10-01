const mongoose = require('mongoose')

let homepageSchema = new mongoose.Schema({
    image_banner: String,
    titre_bloc1: String,
    titre_offre_bloc: String,
    desc_offre_bloc: String,
    titre_bloc_ccm: String,
    desc_bloc_ccm: String,
    titre_bloc_ccm_card1: String,
    titre_bloc_ccm_card2: String,
    titre_bloc_ccm_card3: String,
    desc_bloc_ccm_card1: String,
    desc_bloc_ccm_card2: String,
    desc_bloc_ccm_card3: String,

    titre_bloc1_en: String,
    titre_offre_bloc_en: String,
    desc_offre_bloc_en: String,
    titre_bloc_ccm_en: String,
    desc_bloc_ccm_en: String,
    titre_bloc_ccm_card1_en: String,
    titre_bloc_ccm_card2_en: String,
    titre_bloc_ccm_card3_en: String,
    desc_bloc_ccm_card1_en: String,
    desc_bloc_ccm_card2_en: String,
    desc_bloc_ccm_card3_en: String,

    nous_contacter: String,
    nous_contacter_en: String,
},{timestamps:true})

module.exports = mongoose.model('Offre', homepageSchema)