const mongoose = require('mongoose')
const {ObjectId} = mongoose.Schema.Types

let candidatureSchema = new mongoose.Schema({
    nom: String,
    description: String,
    active: String,
    formation_id: {
        type:ObjectId,
        ref:"Formation"
    },
    user_id: {
        type:ObjectId,
        ref:"User"
    },
    pack: {
        type:ObjectId,
        ref:"Pack"
    },
    fichier: String,
    statut: {
        type: String,
        default: "En cours de traitement"
    },
    comment: String
},{timestamps:true})

module.exports = mongoose.model('Candidature', candidatureSchema)