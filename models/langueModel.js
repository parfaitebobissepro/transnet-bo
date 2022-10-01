const mongoose = require('mongoose')
const {ObjectId} = mongoose.Schema.Types

let langueSchema = new mongoose.Schema({
    nom: String,
    nom_en: String,
    active:{
        type: Boolean,
        default: true
    }
},{timestamps:true})

module.exports = mongoose.model('Langue', langueSchema)