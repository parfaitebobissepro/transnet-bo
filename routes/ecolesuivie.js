const express = require('express')
const router = express.Router()
const passport = require('passport')
const crypto = require('crypto')
const async = require('async')
const nodemailer = require('nodemailer')
const formidable = require('formidable')
var fs = require('fs');

//Requiring user model
const Commande = require('../models/commandeModel')
const User = require('../models/userModel')
const Ecolesuivie = require('../models/ecolesuivieModel')
const Formation = require('../models/formationModel')

//Checks if user is authenticated
function isAuthenticatedUser(req, res, next) {
    if (req.isAuthenticated()) {
        return next()
    }
    req.flash('error_msg', 'Veuillez vous connecter pour accéder à cette page.')
    res.redirect('/login')
}

////////////////===== GET ROUTES =====////////////////

router.get('/dashboard/ecoles-suivies', isAuthenticatedUser, (req, res) => {
    Ecolesuivie.find({user_id:req.params.id})
        .populate('candidat','_id name type')
        .populate('ecole','_id name type nom_ecole')
        .sort({ createdAt: -1 })
        .then(lang => {
            res.render('./ecolesuivie/index', { page: "Liste des écoles suivies", username: req.user.name, user_admin_id: req.user._id,  menu: "ecolesuivie", users: lang })
        })
        .catch(err => {
            console.log(err)
        })
})

router.get('/api/ecole_suivie/:id', (req, res) => {
    var iduser = req.params.id;
    Formation.find({})
        .populate('suiveur','_id name')
        .populate('user_id','_id nom_ecole name email pays_ecole ville_ecole')
        .populate('candidatures','_id user_id formation_id')
        .sort({ createdAt: -1 })
        .then(lang => {
            // console.log(lang);
            var formation_candidat = [];
            lang.forEach((elt)=>{
                if (elt.suiveur.length > 0) {
                    elt.suiveur.forEach((elte)=>{
                        if (elte._id == iduser) {
                            formation_candidat.push(elt);
                        }
                    })
                }
            })
            return res.status(200).json({ type: "success", message: 'Ecole suivie récupérée avec succès !', data:formation_candidat })
        })
        .catch(err => {
            console.log(err)
        })
})

router.get('/api/suiveur_school/:id', (req, res) => {
    let searchQuery = req.params.id
    User.findOne({type: "Ecole"})
        .populate('ecole_suivie','_id name')
        .sort({ createdAt: -1 })
        .then(lang => {
            console.log(lang);
            var ecolesuivie = [];
            lang.forEach((elt)=>{
                if (elt.ecole_suivie.length > 0) {
                    elt.ecole_suivie.forEach((elte)=>{
                        if (elte._id == searchQuery) {
                            ecolesuivie.push(elt);
                        }
                    })
                }
            })
            return res.status(200).json({ type: "success", message: 'Ecoles suivies récupérées avec succès !', data:ecolesuivie })
        })
        .catch(err => {
            console.log(err)
        })
})

////////////////===== POST ROUTES =====////////////////

router.post('/likerformation-universcity', (req, res, next) => {
    const form = formidable({ multiples: true });
    var champs = [];
    var filese = [];
    form.on('field', function (fieldName, fieldValue) {
        champs.push({ key: fieldName, value: fieldValue });
    });
    form.parse(req, (err, fields, files) => {
        var uploadedFile = [];
        var category_data = {};
        var i = 0;
        function filtrage(params, type) {
            var filteredArray = [];
            if (type == "field") {
                filteredArray = champs.filter(champ => champ.key == params);
            } else {
                filteredArray = uploadedFile.filter(champ => champ.key == params);
            }
            if (filteredArray.length > 1) {
                var charge = [];
                filteredArray.forEach(element => {
                    charge.push(element.value);
                })
                category_data[params.split('[')[0]] = JSON.stringify(charge);
            } else {
                var charge = filteredArray[0].value;
                category_data[params.split('[')[0]] = params.split('[').length >= 2 ? JSON.stringify([filteredArray[0].value]) : charge;
            }
        }
        champs.forEach(element => {
            // if (element.key != "user_id") {
                filtrage(element.key, "field");
            // }
        });
        // console.log(category_data);
        // var ecolesuivie = new Ecolesuivie(category_data)
        // ecolesuivie.save().then(resulta => {
            Formation.findOne({ _id: fields.formation })
                .then(users => {
                    if (fields.type == "like") {
                        users.suiveur.push(fields.user);
                        users.save()
                            .then(reponse => {
                                User.findOne({_id: fields.user})
                                    .then(utilisateur => {
                                        utilisateur.suiveur.push(users._id);
                                        utilisateur.save();
                                        return res.status(200).json({ type: "success", message: 'Formation suivie avec succès !', data:users })
                                    })
                                    .catch(err => {
                                        console.log(err)
                                    })
                            })
                            .catch(err => {
                                console.log(err)
                            });
                    } else {
                        var position = users.suiveur.indexOf(fields.user)
                        users.suiveur.splice(position, 1);
                        users.save()
                            .then(reponse => {
                                User.findOne({_id: fields.user})
                                    .then(utilisateur => {
                                        var positione = utilisateur.suiveur.indexOf(users._id)
                                        utilisateur.suiveur.splice(positione, 1);
                                        utilisateur.save();
                                        return res.status(200).json({ type: "success", message: 'Formation dislikée avec succès !', data:users })
                                    })
                                    .catch(err => {
                                        console.log(err)
                                    })
                            })
                            .catch(err => {
                                console.log(err)
                            });
                    }
                })
                .catch(err => {
                    console.log(err);
                })
        // })
    });
})

router.post('/followschool-universcity', (req, res, next) => {
    const form = formidable({ multiples: true });
    var champs = [];
    var filese = [];
    form.on('field', function (fieldName, fieldValue) {
        champs.push({ key: fieldName, value: fieldValue });
    });
    form.parse(req, (err, fields, files) => {
        var uploadedFile = [];
        var category_data = {};
        var i = 0;
        function filtrage(params, type) {
            var filteredArray = [];
            if (type == "field") {
                filteredArray = champs.filter(champ => champ.key == params);
            } else {
                filteredArray = uploadedFile.filter(champ => champ.key == params);
            }
            if (filteredArray.length > 1) {
                var charge = [];
                filteredArray.forEach(element => {
                    charge.push(element.value);
                })
                category_data[params.split('[')[0]] = JSON.stringify(charge);
            } else {
                var charge = filteredArray[0].value;
                category_data[params.split('[')[0]] = params.split('[').length >= 2 ? JSON.stringify([filteredArray[0].value]) : charge;
            }
        }
        champs.forEach(element => {
            filtrage(element.key, "field");
        });
        User.findOne({ _id: fields.ecole })
            .then(users => {
                console.log("on teste");
                console.log(users);
                console.log(users.name);
                console.log(fields.user_id);
                if (fields.type == "like") {
                    users.ecole_suivie.push(fields.user_id);
                    users.save();
                    User.findOne({_id: fields.user_id})
                        .then(utilisateur => {
                            console.log(utilisateur);
                            utilisateur.ecole_suivie.push(users._id);
                            utilisateur.save();
                            return res.status(200).json({ type: "success", message: fields.lang == "en" ? 'School followed successfully' : 'Ecole suivie avec succès !', data:users })
                        })
                        .catch(err => {
                            console.log(err)
                        })
                } else {
                    var position = users.ecole_suivie.indexOf(fields.user_id)
                    users.ecole_suivie.splice(position, 1);
                    users.save();
                    User.findOne({_id: fields.user_id})
                        .then(utilisateur => {
                            console.log(utilisateur);
                            var positionk = utilisateur.ecole_suivie.indexOf(fields.user_id)
                            utilisateur.ecole_suivie.splice(positionk, 1);
                            utilisateur.save();
                            return res.status(200).json({ type: "success", message: fields.lang == "en" ? 'You stopped to follow this school' : 'Vous avez arreté de suivre cette école avec succès !', data:users })
                        })
                        .catch(err => {
                            console.log(err)
                        })
                }
            })
            .catch(err => {
                console.log(err);
            })
    });
})


module.exports = router