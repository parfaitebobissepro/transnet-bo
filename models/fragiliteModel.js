const mongoose = require('mongoose')

let categorySchema = new mongoose.Schema({
    debut_fragilite: Number,
    fin_fragilite: Number,
    prix: Number
},{timestamps:true})

module.exports = mongoose.model('DevisFragilite', categorySchema)