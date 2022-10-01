const mongoose = require('mongoose')
const {ObjectId} = mongoose.Schema.Types

let candidatureSchema = new mongoose.Schema({
    subject_ok: String,
    content_ok: String,
    subject_no: String,
    content_no: String,
    subject_interview: String,
    content_interview: String,
    user_id: {
        type:ObjectId,
        ref:"User"
    }
},{timestamps:true})

module.exports = mongoose.model('ReponseMail', candidatureSchema)