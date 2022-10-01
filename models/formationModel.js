const mongoose = require('mongoose')
const {ObjectId} = mongoose.Schema.Types

let formationSchema = new mongoose.Schema({
    nom: String,
    description: String,
    nom_en: String,
    description_en: String,
    domaine: {
        type:ObjectId,
        ref:"Domaine"
    },
    campus1: String,
    campus2: String,
    cout: String, 
    date_limite: String,
    rentree_scolaire: String,
    frais_dossier: String,
    slug: String,
    en_vedette: {
        type: String,
        default: "off"
    },
    deleted: String,
    renew: Number,
    date_renew: Date,
    active:{
        type: Boolean,
        default: true
    },
    user_id:{
        type:ObjectId,
        ref:"User"
    },
    vue: {
        type: Number,
        default: 0
    },
    suiveur:[{
        type:ObjectId,
        ref:"User"
    }],
    candidatures:[{
        type:ObjectId,
        ref:"Candidature"
    }],
    langues:[{
        type:ObjectId,
        ref:"Langue"
    }]
},{timestamps:true})

module.exports = mongoose.model('Formation', formationSchema)