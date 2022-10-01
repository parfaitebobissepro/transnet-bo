const mongoose = require('mongoose')

let packSchema = new mongoose.Schema({
    nom: String,
    description: String,
    description_en: String,
    montant: String,
    montant_lettre: String,
    option_ecole: String,
    option_etudiant: String,
    type: String,
    essai: String,
    place: String,
    aide_logement: String,
    aide_postvisa: String,
    active: {
        type: Boolean,
        default: true
    },
},{timestamps:true})

module.exports = mongoose.model('Pack', packSchema)