const mongoose = require('mongoose')
const {ObjectId} = mongoose.Schema.Types

let userlangueSchema = new mongoose.Schema({
    user_id: {
        type:ObjectId,
        ref:"User"
    },
    langue_eleve: String,
    attestation_langue_eleve: String,
},{timestamps:true})
module.exports = mongoose.model('UserLangue', userlangueSchema)