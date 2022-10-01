const mongoose = require('mongoose')

let categorySchema = new mongoose.Schema({
    name: String,
    desc: String,
    name_en: String,
    desc_en: String,
    image: String,
    slug: String
},{timestamps:true})

module.exports = mongoose.model('Publicite', categorySchema)