const express = require('express')
const router = express.Router()
const passport = require('passport')
const crypto = require('crypto')
const async = require('async')
const nodemailer = require('nodemailer')
const formidable = require('formidable')
var fs = require('fs');

//Requiring user model
const Formation = require('../models/formationModel')
const Homepage = require('../models/homepageModel')
const Partner = require('../models/partnerModel')
const Slide = require('../models/slideModel')
const Autresection = require('../models/autresectionModel')
const Offre = require('../models/nosoffresModel')
const Orientation = require('../models/orientationModel')
const User = require('../models/userModel')

//Checks if user is authenticated
function isAuthenticatedUser(req, res, next) {
    if (req.isAuthenticated()) {
        return next()
    }
    req.flash('error_msg', 'Veuillez vous connecter pour accéder à cette page.')
    res.redirect('/login')
}

////////////////===== GET ROUTES =====////////////////

router.get('/dashboard/homepage', isAuthenticatedUser, (req, res) => {
    Homepage.find({})
        .sort({ createdAt: -1 })
        .then(lang => {
            Slide.find({})
                .sort({ createdAt: -1 })
                .then(slides => {
                    Autresection.find({})
                        .sort({ createdAt: -1 })
                        .then(autresections => {
                            res.render('./page/homepage', { page: "HomePage Front", username: req.user.name, user_admin_id: req.user._id,  menu: "page", users: lang, slides, autresections })
                        })
                        .catch(err => {
                            console.log(err)
                        })
                })
                .catch(err => {
                    console.log(err)
                })
        })
        .catch(err => {
            console.log(err)
        })
})

router.get('/dashboard/partnerpage', isAuthenticatedUser, (req, res) => {
    Partner.find({})
        .sort({ createdAt: -1 })
        .then(lang => {
            res.render('./page/partnerpage', { page: "Partenaire Front", username: req.user.name, user_admin_id: req.user._id,  menu: "page", users: lang })
        })
        .catch(err => {
            console.log(err)
        })
})


router.get('/api/stat_counter', (req, res) => {
    User.find({type:"Ecole",active:true})
        .sort({createdAt:-1})
        .then(ecoles => {
            User.find({type:"Etudiant",active:true})
                .sort({createdAt:-1})
                .then(etudiants => {
                    Formation.find({active:true})
                        .sort({ createdAt: -1 })
                        .then(formations => {
                            var inscriptions = etudiants.length + ecoles.length;
                            var resultat = {};
                            resultat["etudiants"] = etudiants.length;
                            resultat["ecoles"] = ecoles.length;
                            resultat["formations"] = formations.length;
                            resultat["inscriptions"] = inscriptions;
                            return res.status(200).json({ type: "success", message: 'Stat récupérée avec succès !', data:resultat })
                        })
                        .catch(err => {
                            console.log(err)
                        })
                })
                .catch(err => {
                    console.log(err)
                })
        })
        .catch(err => {
            console.log(err)
        })
})


router.get('/api/partnerpage', (req, res) => {
    Partner.find({})
        .sort({ createdAt: -1 })
        .then(lang => {
            return res.status(200).json({ type: "success", message: 'Partenaires récupérés avec succès !', data:lang })
            // res.render('./page/partnerpage', { page: "Partenaire Front", username: req.user.name, user_admin_id: req.user._id,  menu: "page", users: lang })
        })
        .catch(err => {
            console.log(err)
        })
})

router.get('/dashboard/nosoffrespage', isAuthenticatedUser, (req, res) => {
    Offre.find({})
        .sort({ createdAt: -1 })
        .then(offres => {
            res.render('./page/nosoffrespage', { page: "Nos Offres Front", username: req.user.name, user_admin_id: req.user._id,  menu: "page", offres })
        })
        .catch(err => {
            console.log(err)
        })
})

router.get('/dashboard/orientationpage', isAuthenticatedUser, (req, res) => {
    Orientation.find({})
        .sort({ createdAt: -1 })
        .then(orientations => {
            res.render('./page/orientationpage', { page: "Nos conseils & orientation Front", username: req.user.name, user_admin_id: req.user._id,  menu: "page", orientations })
        })
        .catch(err => {
            console.log(err)
        })
})

router.get('/api/avis_client', (req, res) => {
    Homepage.find({})
        .sort({ createdAt: -1 })
        .then(lang => {
            return res.status(200).json({ type: "success", message: 'Avis recupéré avec succès !', data:lang })
            // res.render('./page/homepage', { page: "HomePage Front", username: req.user.name, user_admin_id: req.user._id,  menu: "page", users: lang })
        })
        .catch(err => {
            console.log(err)
        })
})

router.get('/api/slides', (req, res) => {
    Slide.find({})
        .sort({ createdAt: -1 })
        .then(lang => {
            return res.status(200).json({ type: "success", message: 'Slides recupérés avec succès !', data:lang })
        })
        .catch(err => {
            console.log(err)
        })
})

router.get('/api/home-autre-section', (req, res) => {
    Autresection.findOne({})
        .sort({ createdAt: -1 })
        .then(lang => {
            return res.status(200).json({ type: "success", message: 'Autre section recupérée avec succès !', data:lang })
        })
        .catch(err => {
            console.log(err)
        })
})

router.get('/api/nos-offres-page', (req, res) => {
    Offre.findOne({})
        .sort({ createdAt: -1 })
        .then(lang => {
            return res.status(200).json({ type: "success", message: 'Nos offres recupérées avec succès !', data:lang })
        })
        .catch(err => {
            console.log(err)
        })
})

router.get('/api/orientation-page', (req, res) => {
    Orientation.findOne({})
        .sort({ createdAt: -1 })
        .then(lang => {
            return res.status(200).json({ type: "success", message: 'Orientation recupérée avec succès !', data:lang })
        })
        .catch(err => {
            console.log(err)
        })
})

// router.get('/dashboard/formations/add', isAuthenticatedUser, (req, res) => {
//     Langue.find({})
//         .sort({ createdAt: -1 })
//         .then(lang => {
//             res.render('./formations/add', { page: "Ajouter une formation", username: req.user.name, user_admin_id: req.user._id,  menu: "formation", lang })
//         })
//         .catch(err => {
//             console.log(err)
//         })
// })

// router.get('/dashboard/formations/edit/:id', isAuthenticatedUser, (req, res) => {
//     let searchQuery = { _id: req.params.id }

//     Formation.findOne(searchQuery)
//         .populate('user_id','_id name')
//         .then(formation => {
//             Langue.find({})
//                 .sort({ createdAt: -1 })
//                 .then(lang => {
//                     res.render('./formations/edit', { lang, formation, page: "Modifier une formation", username: req.user.name, user_admin_id: req.user._id,  menu: "formation" })
//                 })
//                 .catch(err => {
//                     console.log(err)
//                 })
//         })
//         .catch(err => {
//             console.log(err);
//             res.redirect('/dashboard/formations')
//         })
// })

router.get('/dashboard/partner/delete/:id', isAuthenticatedUser, (req, res) => {
    let searchQuery = { _id: req.params.id }

    Partner.deleteOne(searchQuery)
        .then(lang => {
            return res.status(200).json({ type: "success", message: 'Image de partenaire supprimée avec succès !' })
        })
        .catch(err => {
            console.log(err);
            return res.status(200).json({ type: "error", message: 'Erreur '+err })
        })
})

router.get('/dashboard/slide/delete/:id', isAuthenticatedUser, (req, res) => {
    let searchQuery = { _id: req.params.id }

    Slide.deleteOne(searchQuery)
        .then(lang => {
            return res.status(200).json({ type: "success", message: 'Slide supprimé avec succès !' })
        })
        .catch(err => {
            console.log(err);
            return res.status(200).json({ type: "error", message: 'Erreur '+err })
        })
})

router.get('/dashboard/avis/delete/:id', isAuthenticatedUser, (req, res) => {
    let searchQuery = { _id: req.params.id }

    Homepage.deleteOne(searchQuery)
        .then(lang => {
            return res.status(200).json({ type: "success", message: 'Avis supprimé avec succès !' })
        })
        .catch(err => {
            console.log(err);
            return res.status(200).json({ type: "error", message: 'Erreur '+err })
        })
})

// ////////////////===== POST ROUTES =====////////////////

router.post('/addedit-homepage', (req, res, next) => {
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
                // console.log(element.file);
                var oldpath = element.file.path;
                var newpath = 'public/uploads/imageupload' + new Date().getTime()+i+"."+element.file.type.split('/')[1];
                fs.rename(oldpath, newpath, function (err) {
                    // if (err) throw err;
                    // console.log("Image uploaded at this path: "+newpath);
                });
                newpath = newpath.split("public/")[1];
                uploadedFile.push({key:element.field,value:"/"+newpath});
            }else{
                if(fields.id_avis == "no"){
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
            if (element.key != "id_avis") {
                filtrage(element.key, "field");
            }
        });
        uploadedFile.forEach(element => {
            switch (element.key) {
                case "image_avis":
                    filtrage("image_avis", "file");
                    break;
                default:
                    break;
            }
        })
        // console.log(category_data);
        var formation = new Homepage(category_data)
        if (fields.id_avis == "no") {
            formation.save().then(result => {
                return res.status(200).json({ type: "success", message: 'Avis crée avec succès !', result })
            })
        } else {
            var searchQuery = { _id: fields.id_avis }
            Homepage.updateOne(searchQuery, {
                $set: category_data
            })
                .then(result => {
                    return res.status(200).json({ type: "success", message: 'Avis modifié avec succès !', result })
                })
                .catch(err => {
                    return res.status(422).json({ type: "error", message: 'ERROR: ' + err })
                })
        }
    });
})

router.post('/addedit-partnerpage', (req, res, next) => {
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
                // console.log(element.file);
                var oldpath = element.file.path;
                var newpath = 'public/uploads/imageupload' + new Date().getTime()+i+"."+element.file.type.split('/')[1];
                fs.rename(oldpath, newpath, function (err) {
                    // if (err) throw err;
                    // console.log("Image uploaded at this path: "+newpath);
                });
                newpath = newpath.split("public/")[1];
                uploadedFile.push({key:element.field,value:"/"+newpath});
            }else{
                if(fields.id_avis == "no"){
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
            if (element.key != "id_partner") {
                filtrage(element.key, "field");
            }
        });
        uploadedFile.forEach(element => {
            switch (element.key) {
                case "image_partner":
                    filtrage("image_partner", "file");
                    break;
                default:
                    break;
            }
        })
        // console.log(category_data);
        var formation = new Partner(category_data)
        if (fields.id_partner == "no") {
            formation.save().then(result => {
                return res.status(200).json({ type: "success", message: 'Image partenaire créee avec succès !', result })
            })
        } else {
            var searchQuery = { _id: fields.id_partner }
            Partner.updateOne(searchQuery, {
                $set: category_data
            })
                .then(result => {
                    return res.status(200).json({ type: "success", message: 'Image partenaire modifié avec succès !', result })
                })
                .catch(err => {
                    return res.status(422).json({ type: "error", message: 'ERROR: ' + err })
                })
        }
    });
})

router.post('/addedit-slide', (req, res, next) => {
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
                // console.log(element.file);
                var oldpath = element.file.path;
                var newpath = 'public/uploads/imageupload' + new Date().getTime()+i+"."+element.file.type.split('/')[1];
                fs.rename(oldpath, newpath, function (err) {
                    // if (err) throw err;
                    // console.log("Image uploaded at this path: "+newpath);
                });
                newpath = newpath.split("public/")[1];
                uploadedFile.push({key:element.field,value:"/"+newpath});
            }else{
                if(fields.id_avis == "no"){
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
            // console.log(champs);
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
            if (element.key != "id_slide") {
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
        // console.log(category_data);
        var formation = new Slide(category_data)
        if (fields.id_slide == "no") {
            formation.save().then(result => {
                return res.status(200).json({ type: "success", message: 'Slide crée avec succès !', result })
            })
        } else {
            var searchQuery = { _id: fields.id_slide }
            Slide.updateOne(searchQuery, {
                $set: category_data
            })
                .then(result => {
                    return res.status(200).json({ type: "success", message: 'Slide modifié avec succès !', result })
                })
                .catch(err => {
                    return res.status(422).json({ type: "error", message: 'ERROR: ' + err })
                })
        }
    });
})

router.post('/addedit-autresection', (req, res, next) => {
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
                // console.log(element.file);
                var oldpath = element.file.path;
                var newpath = 'public/uploads/imageupload' + new Date().getTime()+i+"."+element.file.type.split('/')[1];
                fs.rename(oldpath, newpath, function (err) {
                    // if (err) throw err;
                    // console.log("Image uploaded at this path: "+newpath);
                });
                newpath = newpath.split("public/")[1];
                uploadedFile.push({key:element.field,value:"/"+newpath});
            }else{
                if(fields.id_avis == "no"){
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
            // console.log(champs);
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
            if (element.key != "id_autresection") {
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
        // console.log(category_data);
        var formation = new Autresection(category_data)
        if (fields.id_autresection == "no") {
            Autresection.find({})
                .sort({ createdAt: -1 })
                .then(autresections => {
                    if (autresections.length == 0) {
                        formation.save().then(result => {
                            return res.status(200).json({ type: "success", message: 'Autre section modifiée avec succès !', result })
                        })
                    } else {
                        return res.status(200).json({ type: "error", message: 'Vous ne pouvez pas ajouter de section !' })
                    }
                })
                .catch(err => {
                    return res.status(422).json({ type: "error", message: 'ERROR: ' + err })
                })
        } else {
            var searchQuery = { _id: fields.id_autresection }
            Autresection.updateOne(searchQuery, {
                $set: category_data
            })
                .then(result => {
                    return res.status(200).json({ type: "success", message: 'Autre section modifiée avec succès !', result })
                })
                .catch(err => {
                    return res.status(422).json({ type: "error", message: 'ERROR: ' + err })
                })
        }
    });
})

router.post('/addedit-offre', (req, res, next) => {
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
                // console.log(element.file);
                var oldpath = element.file.path;
                var newpath = 'public/uploads/imageupload' + new Date().getTime()+i+"."+element.file.type.split('/')[1];
                fs.rename(oldpath, newpath, function (err) {
                    // if (err) throw err;
                    // console.log("Image uploaded at this path: "+newpath);
                });
                newpath = newpath.split("public/")[1];
                uploadedFile.push({key:element.field,value:"/"+newpath});
            }else{
                if(fields.id_avis == "no"){
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
            // console.log(champs);
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
            if (element.key != "id_offre") {
                filtrage(element.key, "field");
            }
        });
        uploadedFile.forEach(element => {
            switch (element.key) {
                case "image_banner":
                    filtrage("image_banner", "file");
                    break;
                default:
                    break;
            }
        })
        // console.log(category_data);
        var formation = new Offre(category_data)
        if (fields.id_offre == "no") {
            Offre.find({})
                .sort({ createdAt: -1 })
                .then(offres => {
                    if (offres.length == 0) {
                        formation.save().then(result => {
                            return res.status(200).json({ type: "success", message: 'Section Nos offres modifiée avec succès !', result })
                        })
                    } else {
                        return res.status(200).json({ type: "error", message: 'Vous ne pouvez pas ajouter de section !' })
                    }
                })
                .catch(err => {
                    return res.status(422).json({ type: "error", message: 'ERROR: ' + err })
                })
        } else {
            var searchQuery = { _id: fields.id_offre }
            Offre.updateOne(searchQuery, {
                $set: category_data
            })
                .then(result => {
                    return res.status(200).json({ type: "success", message: 'Section Nos offres modifiée avec succès !', result })
                })
                .catch(err => {
                    return res.status(422).json({ type: "error", message: 'ERROR: ' + err })
                })
        }
    });
})

router.post('/addedit-orientation', (req, res, next) => {
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
                // console.log(element.file);
                var oldpath = element.file.path;
                var newpath = 'public/uploads/imageupload' + new Date().getTime()+i+"."+element.file.type.split('/')[1];
                fs.rename(oldpath, newpath, function (err) {
                    // if (err) throw err;
                    // console.log("Image uploaded at this path: "+newpath);
                });
                newpath = newpath.split("public/")[1];
                uploadedFile.push({key:element.field,value:"/"+newpath});
            }else{
                if(fields.id_orientation == "no"){
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
            // console.log(champs);
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
            if (element.key != "id_orientation") {
                filtrage(element.key, "field");
            }
        });
        uploadedFile.forEach(element => {
            switch (element.key) {
                case "image_banner":
                    filtrage("image_banner", "file");
                    break;
                case "image_bloc1":
                    filtrage("image_bloc1", "file");
                    break;
                case "image_bloc2":
                    filtrage("image_bloc2", "file");
                    break;
                case "image_bloc3":
                    filtrage("image_bloc3", "file");
                    break;
                case "image_bloc4":
                    filtrage("image_bloc4", "file");
                    break;
                case "image_bloc5":
                    filtrage("image_bloc5", "file");
                    break;
                case "image_bloc6":
                    filtrage("image_bloc6", "file");
                    break;
                case "image_bloc7":
                    filtrage("image_bloc7", "file");
                    break;
                case "image_bloc8":
                    filtrage("image_bloc8", "file");
                    break;
                case "image_bloc9":
                    filtrage("image_bloc9", "file");
                    break;
                default:
                    break;
            }
        })
        // console.log(category_data);
        var formation = new Orientation(category_data)
        if (fields.id_orientation == "no") {
            Orientation.find({})
                .sort({ createdAt: -1 })
                .then(orientations => {
                    if (orientations.length == 0) {
                        formation.save().then(result => {
                            return res.status(200).json({ type: "success", message: 'Section Nos conseils & orientations modifiée avec succès !', result })
                        })
                    } else {
                        return res.status(200).json({ type: "error", message: 'Vous ne pouvez pas ajouter de section !' })
                    }
                })
                .catch(err => {
                    return res.status(422).json({ type: "error", message: 'ERROR: ' + err })
                })
        } else {
            var searchQuery = { _id: fields.id_orientation }
            Orientation.updateOne(searchQuery, {
                $set: category_data
            })
                .then(result => {
                    return res.status(200).json({ type: "success", message: 'Section Nos conseils & orientations modifiée avec succès !', result })
                })
                .catch(err => {
                    return res.status(422).json({ type: "error", message: 'ERROR: ' + err })
                })
        }
    });
})

module.exports = router