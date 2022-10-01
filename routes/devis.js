const express = require('express')
const router = express.Router()
const passport = require('passport')
const crypto = require('crypto')
const async = require('async')
const nodemailer = require('nodemailer')
const formidable = require('formidable')
var fs = require('fs');

//Requiring user model
// const Formation = require('../models/formationModel')
const DevisDistance = require('../models/distanceModel')
const DevisPoids = require('../models/poidsModel')
const DevisFragilite = require('../models/fragiliteModel')

//Checks if user is authenticated
function isAuthenticatedUser(req, res, next) {
    if (req.isAuthenticated()) {
        return next()
    }
    req.flash('error_msg', 'Veuillez vous connecter pour accéder à cette page.')
    res.redirect('/login')
}

const sortByName = (x, y) => {
    let a = x.name.toUpperCase(),
        b = y.name.toUpperCase();
    return a == b ? 0 : a > b ? 1 : -1;
  }

////////////////===== GET ROUTES =====////////////////

router.get('/dashboard/devis/poids', isAuthenticatedUser, (req, res) => {
    DevisPoids.find({})
        .sort({ createdAt: -1 })
        .then(lang => {
            res.render('./devis_poids/index', { page: "Liste des devis poids", username: req.user.name, user_admin_id: req.user._id,  menu: "devis", devis: lang })
        })
        .catch(err => {
            console.log(err)
        })
})

router.get('/dashboard/devis/fragilite', isAuthenticatedUser, (req, res) => {
    DevisFragilite.find({})
        .sort({ createdAt: -1 })
        .then(lang => {
            res.render('./devis_fragilite/index', { page: "Liste des devis fragilite", username: req.user.name, user_admin_id: req.user._id,  menu: "devis", devis: lang })
        })
        .catch(err => {
            console.log(err)
        })
})

router.get('/dashboard/devis/distance', isAuthenticatedUser, (req, res) => {
    DevisDistance.find({})
        .sort({ createdAt: -1 })
        .then(lang => {
            res.render('./devis_distance/index', { page: "Liste des devis distance", username: req.user.name, user_admin_id: req.user._id,  menu: "devis", devis: lang })
        })
        .catch(err => {
            console.log(err)
        })
})


router.get('/dashboard/devis/poids/add', isAuthenticatedUser, (req, res) => {
    res.render('./devis_poids/add', { page: "Ajouter un devis", username: req.user.name, user_admin_id: req.user._id,  menu: "devis" })
})
router.get('/dashboard/devis/distance/add', isAuthenticatedUser, (req, res) => {
    res.render('./devis_distance/add', { page: "Ajouter un devis", username: req.user.name, user_admin_id: req.user._id,  menu: "devis" })
})
router.get('/dashboard/devis/fragilite/add', isAuthenticatedUser, (req, res) => {
    res.render('./devis_fragilite/add', { page: "Ajouter un devis", username: req.user.name, user_admin_id: req.user._id,  menu: "devis" })
})

router.get('/dashboard/devis/poids/edit/:id', isAuthenticatedUser, (req, res) => {
    let searchQuery = { _id: req.params.id }

    DevisPoids.findOne(searchQuery)
        .then(categorie => {
            res.render('./devis_poids/edit', { categorie, page: "Modifier un devis", username: req.user.name, user_admin_id: req.user._id,  menu: "devis" })
        })
        .catch(err => {
            console.log(err);
            res.redirect('/dashboard/devis/poids')
        })
})
router.get('/dashboard/devis/distance/edit/:id', isAuthenticatedUser, (req, res) => {
    let searchQuery = { _id: req.params.id }

    DevisDistance.findOne(searchQuery)
        .then(categorie => {
            res.render('./devis_distance/edit', { categorie, page: "Modifier un devis", username: req.user.name, user_admin_id: req.user._id,  menu: "devis" })
        })
        .catch(err => {
            console.log(err);
            res.redirect('/dashboard/devis/distance')
        })
})
router.get('/dashboard/devis/fragilite/edit/:id', isAuthenticatedUser, (req, res) => {
    let searchQuery = { _id: req.params.id }

    DevisFragilite.findOne(searchQuery)
        .then(categorie => {
            res.render('./devis_fragilite/edit', { categorie, page: "Modifier un devis", username: req.user.name, user_admin_id: req.user._id,  menu: "devis" })
        })
        .catch(err => {
            console.log(err);
            res.redirect('/dashboard/devis/fragilite')
        })
})

router.get('/dashboard/devis/poids/delete/:id', isAuthenticatedUser, (req, res) => {
    let searchQuery = { _id: req.params.id }

    DevisPoids.deleteOne(searchQuery)
        .then(lang => {
            return res.status(200).json({ type: "success", message: 'Devis supprimé avec succès !' })
        })
        .catch(err => {
            console.log(err);
            return res.status(200).json({ type: "error", message: 'Erreur '+err })
        })
})
router.get('/dashboard/devis/distance/delete/:id', isAuthenticatedUser, (req, res) => {
    let searchQuery = { _id: req.params.id }

    DevisDistance.deleteOne(searchQuery)
        .then(lang => {
            return res.status(200).json({ type: "success", message: 'Devis supprimé avec succès !' })
        })
        .catch(err => {
            console.log(err);
            return res.status(200).json({ type: "error", message: 'Erreur '+err })
        })
})
router.get('/dashboard/devis/fragilite/delete/:id', isAuthenticatedUser, (req, res) => {
    let searchQuery = { _id: req.params.id }

    DevisFragilite.deleteOne(searchQuery)
        .then(lang => {
            return res.status(200).json({ type: "success", message: 'Devis supprimé avec succès !' })
        })
        .catch(err => {
            console.log(err);
            return res.status(200).json({ type: "error", message: 'Erreur '+err })
        })
})


////////////////===== DEVIS ROUTE =====////////////////

router.post('/api/devis', (req, res, next) => {
    const form = formidable({ multiples: true });
    form.parse(req, (err, fields, files) => {
        var poids = fields.poids;
        var distance = fields.distance;
        var fragilite = fields.fragilite;
        console.log(poids);
        DevisPoids.findOne({
            $and: [
                {
                    debut_poids: { $lte: poids },
                    fin_poids: { $gte: poids }
                }
            ]
        })
        .then(result_poids => {
            var prix_poids = result_poids.prix != null ? result_poids.prix : 0;
            DevisDistance.findOne({
                $and: [
                    {
                        debut_km: { $lte: distance },
                        fin_km: { $gte: distance }
                    }
                ]
            })
            .then(result_distance => {
                var prix_distance = result_distance.prix != null ? result_distance.prix : 0;
                DevisFragilite.findOne({
                    $and: [
                        {
                            debut_fragilite: { $lte: fragilite },
                            fin_fragilite: { $gte: fragilite }
                        }
                    ]
                })
                .then(result_fragilite => {
                    var prix_fragilite = result_fragilite.prix != null ? result_fragilite.prix : 0;
                    var total = prix_poids + prix_distance + prix_fragilite;
                    return res.status(200).json({ type: "success", message: 'Devis recupéré avec succès !', data:total })
                })
                .catch(err => {
                    console.log(err);
                    return res.status(500).json({ type: "error", message: 'Une erreur est survenue lors de la récuperation du devis !' })
                })
            })
            .catch(err => {
                console.log(err);
                return res.status(500).json({ type: "error", message: 'Une erreur est survenue lors de la récuperation du devis !' })
            })
        })
        .catch(err => {
            console.log(err);
            return res.status(500).json({ type: "error", message: 'Une erreur est survenue lors de la récuperation du devis !' })
        })
    });
})

////////////////===== POST ROUTES =====////////////////

router.post('/addedit-devis-poids', (req, res, next) => {
    const form = formidable({ multiples: true });
    var champs = [];
    var filese = [];
    form.on('field', function(fieldName, fieldValue) {
        champs.push({key:fieldName, value:fieldValue});
    });
    form.on('file', function(field, file) {
        filese.push({field:field, file:file});
    });
    form.parse(req, (err, fields, files) => {
        var uploadedFile = [];
        var category_data = {};
        var i = 0;
        filese.forEach(element => {
            i++;
            if (element.file.size > 0) {
                var oldpath = element.file.path;
                var newpath = 'public/uploads/imageupload' + new Date().getTime()+i+"."+element.file.type.split('/')[1];
                fs.rename(oldpath, newpath, function (err) {
                });
                newpath = newpath.split("public/")[1];
                uploadedFile.push({key:element.field,value:"/"+newpath});
            }else{
                if(fields.id_eleve == "no"){
                    uploadedFile.push({key:element.field,value:"/"});
                }
            }
        }) 
        function filtrage(params,type) {
            var filteredArray = [];
            if(type == "field"){
                filteredArray = champs.filter( champ => champ.key == params );
            }else{
                filteredArray = uploadedFile.filter( champ => champ.key == params );
            }
            console.log(champs);
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
            if (element.key != "id_devis") {
                filtrage(element.key, "field");
            }
        });
        uploadedFile.forEach(element => {
            switch (element.key) {
                case "image":
                    filtrage("image", "file");
                    break;
                default:
                    break;
            }
        })
        
        var devis = new DevisPoids(category_data)
        if (fields.id_devis == "no") {
            devis.save().then(result => {
                return res.status(200).json({ type: "success", message: 'Devis crée avec succès !', result })
            })
        } else {
            var searchQuery = { _id: fields.id_devis }
            DevisPoids.updateOne(searchQuery, {
                $set: category_data
            })
                .then(result => {
                    return res.status(200).json({ type: "success", message: 'Devis modifié avec succès !', result })
                })
                .catch(err => {
                    return res.status(422).json({ type: "error", message: 'ERROR: ' + err })
                })
        }
    });
})
router.post('/addedit-devis-distance', (req, res, next) => {
    const form = formidable({ multiples: true });
    var champs = [];
    var filese = [];
    form.on('field', function(fieldName, fieldValue) {
        champs.push({key:fieldName, value:fieldValue});
    });
    form.on('file', function(field, file) {
        filese.push({field:field, file:file});
    });
    form.parse(req, (err, fields, files) => {
        var uploadedFile = [];
        var category_data = {};
        var i = 0;
        filese.forEach(element => {
            i++;
            if (element.file.size > 0) {
                var oldpath = element.file.path;
                var newpath = 'public/uploads/imageupload' + new Date().getTime()+i+"."+element.file.type.split('/')[1];
                fs.rename(oldpath, newpath, function (err) {
                });
                newpath = newpath.split("public/")[1];
                uploadedFile.push({key:element.field,value:"/"+newpath});
            }else{
                if(fields.id_eleve == "no"){
                    uploadedFile.push({key:element.field,value:"/"});
                }
            }
        }) 
        function filtrage(params,type) {
            var filteredArray = [];
            if(type == "field"){
                filteredArray = champs.filter( champ => champ.key == params );
            }else{
                filteredArray = uploadedFile.filter( champ => champ.key == params );
            }
            console.log(champs);
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
            if (element.key != "id_devis") {
                filtrage(element.key, "field");
            }
        });
        uploadedFile.forEach(element => {
            switch (element.key) {
                case "image":
                    filtrage("image", "file");
                    break;
                default:
                    break;
            }
        })
        
        var devis = new DevisDistance(category_data)
        if (fields.id_devis == "no") {
            devis.save().then(result => {
                return res.status(200).json({ type: "success", message: 'Devis crée avec succès !', result })
            })
        } else {
            var searchQuery = { _id: fields.id_devis }
            DevisDistance.updateOne(searchQuery, {
                $set: category_data
            })
                .then(result => {
                    return res.status(200).json({ type: "success", message: 'Devis modifié avec succès !', result })
                })
                .catch(err => {
                    return res.status(422).json({ type: "error", message: 'ERROR: ' + err })
                })
        }
    });
})
router.post('/addedit-devis-fragilite', (req, res, next) => {
    const form = formidable({ multiples: true });
    var champs = [];
    var filese = [];
    form.on('field', function(fieldName, fieldValue) {
        champs.push({key:fieldName, value:fieldValue});
    });
    form.on('file', function(field, file) {
        filese.push({field:field, file:file});
    });
    form.parse(req, (err, fields, files) => {
        var uploadedFile = [];
        var category_data = {};
        var i = 0;
        filese.forEach(element => {
            i++;
            if (element.file.size > 0) {
                var oldpath = element.file.path;
                var newpath = 'public/uploads/imageupload' + new Date().getTime()+i+"."+element.file.type.split('/')[1];
                fs.rename(oldpath, newpath, function (err) {
                });
                newpath = newpath.split("public/")[1];
                uploadedFile.push({key:element.field,value:"/"+newpath});
            }else{
                if(fields.id_eleve == "no"){
                    uploadedFile.push({key:element.field,value:"/"});
                }
            }
        }) 
        function filtrage(params,type) {
            var filteredArray = [];
            if(type == "field"){
                filteredArray = champs.filter( champ => champ.key == params );
            }else{
                filteredArray = uploadedFile.filter( champ => champ.key == params );
            }
            console.log(champs);
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
            if (element.key != "id_devis") {
                filtrage(element.key, "field");
            }
        });
        uploadedFile.forEach(element => {
            switch (element.key) {
                case "image":
                    filtrage("image", "file");
                    break;
                default:
                    break;
            }
        })
        
        var devis = new DevisFragilite(category_data)
        if (fields.id_devis == "no") {
            devis.save().then(result => {
                return res.status(200).json({ type: "success", message: 'Devis crée avec succès !', result })
            })
        } else {
            var searchQuery = { _id: fields.id_devis }
            DevisFragilite.updateOne(searchQuery, {
                $set: category_data
            })
                .then(result => {
                    return res.status(200).json({ type: "success", message: 'Devis modifié avec succès !', result })
                })
                .catch(err => {
                    return res.status(422).json({ type: "error", message: 'ERROR: ' + err })
                })
        }
    });
})

module.exports = router