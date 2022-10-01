const mongoose = require('mongoose')
const {ObjectId} = mongoose.Schema.Types

let userlangueSchema = new mongoose.Schema({
    user_id: {
        type:ObjectId,
        ref:"User"
    },
    titre_honneur: String,
    annee_honneur: String,
    description_honneur: String,
    attestation_honneur: String,
},{timestamps:true})
module.exports = mongoose.model('UserHonneur', userlangueSchema)