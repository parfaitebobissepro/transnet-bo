const mongoose = require('mongoose')

let homepageSchema = new mongoose.Schema({
    image_banner: String,
    titre_bloc1: String,
    soustitre_bloc1: String,
    desc_bloc1: String,
    image_bloc1: String,
    titre_bloc2: String,
    desc_bloc2: String,
    image_bloc2: String,

    titre_bloc1_en: String,
    soustitre_bloc1_en: String,
    desc_bloc1_en: String,
    titre_bloc2_en: String,
    desc_bloc2_en: String,
    
    titre_bloc3: String,
    desc_bloc3: String,
    titre_bloc3_en: String,
    desc_bloc3_en: String,
    image_bloc3: String,
    
    titre_bloc4_en: String,
    desc_bloc4_en: String,
    titre_bloc4: String,
    desc_bloc4: String,
    image_bloc4: String,
    
    titre_bloc5: String,
    desc_bloc5: String,
    titre_bloc5_en: String,
    desc_bloc5_en: String,
    image_bloc5: String,
    
    titre_bloc6: String,
    desc_bloc6: String,
    titre_bloc6_en: String,
    desc_bloc6_en: String,
    image_bloc6: String,
    
    titre_bloc7: String,
    desc_bloc7: String,
    titre_bloc7_en: String,
    desc_bloc7_en: String,
    image_bloc7: String,
    
    titre_bloc8: String,
    desc_bloc8: String,
    titre_bloc8_en: String,
    desc_bloc8_en: String,
    image_bloc8: String,
    
    titre_bloc9: String,
    desc_bloc9: String,
    titre_bloc9_en: String,
    desc_bloc9_en: String,
    image_bloc9: String,
},{timestamps:true})

module.exports = mongoose.model('Orientation', homepageSchema)