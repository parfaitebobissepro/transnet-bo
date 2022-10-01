const mongoose = require('mongoose')
const {ObjectId} = mongoose.Schema.Types

let usereducSchema = new mongoose.Schema({
    user_id: {
        type:ObjectId,
        ref:"User"
    },
    niveau_etude_eleve: String,
    specialisation_eleve: String,
    etablissement_eleve: String,
    pays_etablissement: String,
    debut_etablissement: String,
    fin_etablissement: String,
    desc_formation: String,
    resultat_formation: String,
    bulletin_eleve: String,
    diplome_eleve: String,
},{timestamps:true})
module.exports = mongoose.model('UserEducation', usereducSchema)