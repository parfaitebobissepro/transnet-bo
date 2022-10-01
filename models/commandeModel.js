const mongoose = require('mongoose')
const {ObjectId} = mongoose.Schema.Types

let cmdSchema = new mongoose.Schema({
    cmd: String,
    statut: String,
    produit: String,
    poids: String,
    fragilite: String,
    depart: String,
    arrivee: String,
    distance: String,
    montant: String,
    user_id: {
        type:ObjectId,
        ref:"User"
    },
    transporteur_id: {
        type:ObjectId,
        ref:"User"
    },
},{timestamps:true})

module.exports = mongoose.model('Commande', cmdSchema)