const mongoose = require('mongoose')
const {ObjectId} = mongoose.Schema.Types

let userlangueSchema = new mongoose.Schema({
    user_id: {
        type:ObjectId,
        ref:"User"
    },
    titre_poste_eleve: String,
    entreprise_eleve: String,
    debut_entreprise: String,
    fin_entreprise: String,
    desc_poste_eleve: String,
    attestation_entreprise_eleve: String,
},{timestamps:true})
module.exports = mongoose.model('UserExperience', userlangueSchema)