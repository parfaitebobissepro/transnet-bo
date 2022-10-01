const express = require('express')
const router = express.Router()
const passport = require('passport')
const crypto = require('crypto')
const async = require('async')
const nodemailer = require('nodemailer')
const formidable = require('formidable')
var fs = require('fs');

//Requiring user model
const User = require('../models/userModel')
const UserHonneur = require('../models/userHonneurModel')
const UserExperience = require('../models/userExperienceModel')
const UserLangue = require('../models/userLangueModel')
const UserEducation = require('../models/userEducationModel')

////////////////===== POST ROUTES =====////////////////

router.post('/delete-userhonneur/:id/:user', (req, res) => {
    let searchQuery = { _id: req.params.id }
    let userreq = req.params.user
    let idreq = req.params.id
    UserHonneur.deleteOne(searchQuery)
        .then(user => {
            User.findOne({ _id: userreq })
            .populate('eleve_honneur','_id titre_honneur annee_honneur description_honneur attestation_honneur')
            .populate('eleve_experience','_id titre_poste_eleve entreprise_eleve debut_entreprise fin_entreprise desc_poste_eleve attestation_entreprise_eleve')
            .populate('eleve_langue','_id langue_eleve attestation_langue_eleve')
            .populate('eleve_education','_id niveau_etude_eleve specialisation_eleve etablissement_eleve pays_etablissement debut_etablissement fin_etablissement desc_formation resultat_formation bulletin_eleve diplome_eleve')
            .then(userhon => {
                var posValue = userhon.eleve_honneur.indexOf(idreq);
                userhon.eleve_honneur.splice(posValue, 1);
                userhon.save();
                return res.status(200).json({ type: "success", message: 'Document modifié avec succès !', data:userhon })
            })
            .catch(err => {
                return res.status(422).json({ type: "error", message: 'ERROR: ' + err })
            })
        })
        .catch(err => {
            return res.status(422).json({ error: err })
        })
})

router.post('/delete-userexperience/:id/:user', (req, res) => {
    let searchQuery = { _id: req.params.id }
    let userreq = req.params.user
    let idreq = req.params.id
    UserExperience.deleteOne(searchQuery)
        .then(user => {
            User.findOne({ _id: userreq })
            .populate('eleve_honneur','_id titre_honneur annee_honneur description_honneur attestation_honneur')
            .populate('eleve_experience','_id titre_poste_eleve entreprise_eleve debut_entreprise fin_entreprise desc_poste_eleve attestation_entreprise_eleve')
            .populate('eleve_langue','_id langue_eleve attestation_langue_eleve')
            .populate('eleve_education','_id niveau_etude_eleve specialisation_eleve etablissement_eleve pays_etablissement debut_etablissement fin_etablissement desc_formation resultat_formation bulletin_eleve diplome_eleve')
            .then(userhon => {
                var posValue = userhon.eleve_experience.indexOf(idreq);
                userhon.eleve_experience.splice(posValue, 1);
                userhon.save();
                return res.status(200).json({ type: "success", message: 'Document modifié avec succès !', data:userhon })
            })
            .catch(err => {
                return res.status(422).json({ type: "error", message: 'ERROR: ' + err })
            })
        })
        .catch(err => {
            return res.status(422).json({ error: err })
        })
})

router.post('/delete-userlangue/:id/:user', (req, res) => {
    let searchQuery = { _id: req.params.id }
    let userreq = req.params.user
    let idreq = req.params.id
    UserLangue.deleteOne(searchQuery)
        .then(user => {
            User.findOne({ _id: userreq })
            .populate('eleve_honneur','_id titre_honneur annee_honneur description_honneur attestation_honneur')
            .populate('eleve_experience','_id titre_poste_eleve entreprise_eleve debut_entreprise fin_entreprise desc_poste_eleve attestation_entreprise_eleve')
            .populate('eleve_langue','_id langue_eleve attestation_langue_eleve')
            .populate('eleve_education','_id niveau_etude_eleve specialisation_eleve etablissement_eleve pays_etablissement debut_etablissement fin_etablissement desc_formation resultat_formation bulletin_eleve diplome_eleve')
            .then(userhon => {
                var posValue = userhon.eleve_langue.indexOf(idreq);
                userhon.eleve_langue.splice(posValue, 1);
                userhon.save();
                return res.status(200).json({ type: "success", message: 'Document modifié avec succès !', data:userhon })
            })
            .catch(err => {
                return res.status(422).json({ type: "error", message: 'ERROR: ' + err })
            })
        })
        .catch(err => {
            return res.status(422).json({ error: err })
        })
})

router.post('/delete-usereducation/:id/:user', (req, res) => {
    let searchQuery = { _id: req.params.id }
    let userreq = req.params.user
    let idreq = req.params.id
    UserEducation.deleteOne(searchQuery)
        .then(user => {
            User.findOne({ _id: userreq })
            .populate('eleve_honneur','_id titre_honneur annee_honneur description_honneur attestation_honneur')
            .populate('eleve_experience','_id titre_poste_eleve entreprise_eleve debut_entreprise fin_entreprise desc_poste_eleve attestation_entreprise_eleve')
            .populate('eleve_langue','_id langue_eleve attestation_langue_eleve')
            .populate('eleve_education','_id niveau_etude_eleve specialisation_eleve etablissement_eleve pays_etablissement debut_etablissement fin_etablissement desc_formation resultat_formation bulletin_eleve diplome_eleve')
            .then(userhon => {
                var posValue = userhon.eleve_education.indexOf(idreq);
                userhon.eleve_education.splice(posValue, 1);
                userhon.save();
                return res.status(200).json({ type: "success", message: 'Document modifié avec succès !', data:userhon })
            })
            .catch(err => {
                return res.status(422).json({ type: "error", message: 'ERROR: ' + err })
            })
        })
        .catch(err => {
            return res.status(422).json({ error: err })
        })
})

router.post('/addedit-userhonneur', (req, res, next) => {
    const form = formidable({ multiples: true });
    var champs = [];
    var filese = [];
    form.on('field', function (fieldName, fieldValue) {
        champs.push({ key: fieldName, value: fieldValue });
    });
    form.on('file', function (field, file) {
        filese.push({ field: field, file: file });
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
                var newpath = 'public/uploads/imageupload' + new Date().getTime() + i + "." + element.file.type.split('/')[1];
                fs.rename(oldpath, newpath, function (err) {
                    // if (err) throw err;
                    // console.log("Image uploaded at this path: "+newpath);
                });
                newpath = newpath.split("public/")[1];
                uploadedFile.push({ key: element.field, value: "/" + newpath });
            } else {
                if (fields.id_doc == "no") {
                    uploadedFile.push({ key: element.field, value: "/" });
                }
            }
        })
        function filtrage(params, type) {
            var filteredArray = [];
            if (type == "field") {
                filteredArray = champs.filter(champ => champ.key == params);
            } else {
                filteredArray = uploadedFile.filter(champ => champ.key == params);
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
            if (element.key != "id_honneur") {
                filtrage(element.key, "field");
            }
        });
        uploadedFile.forEach(element => {
            switch (element.key) {
                case "attestation_honneur":
                    filtrage("attestation_honneur", "file");
                    break;
                default:
                    break;
            }
        })
        var docc = new UserHonneur(category_data)
        if (fields.id_honneur == "no") {
            docc.save().then(result => {
                User.findOne({ _id: fields.user_id })
                .populate('eleve_education','_id niveau_etude_eleve specialisation_eleve etablissement_eleve pays_etablissement debut_etablissement fin_etablissement desc_formation resultat_formation bulletin_eleve diplome_eleve')
                .populate('eleve_langue','_id langue_eleve attestation_langue_eleve')
                .populate('eleve_experience','_id titre_poste_eleve entreprise_eleve debut_entreprise fin_entreprise desc_poste_eleve attestation_entreprise_eleve')
                .populate('eleve_honneur','_id titre_honneur annee_honneur description_honneur attestation_honneur')
                .then(userhon => {
                    userhon.eleve_honneur.push(result._id);
                    userhon.save();
                    return res.status(200).json({ type: "success", message: 'Document crée avec succès !', data:userhon })
                })
                .catch(err => {
                    return res.status(422).json({ type: "error", message: 'ERROR: ' + err })
                })
            })
        } else {
            var searchQuery = { _id: fields.id_honneur }
            UserHonneur.updateOne(searchQuery, {
                $set: category_data
            })
                .then(result => {
                    User.findOne({ _id: fields.user_id })
                    .populate('eleve_education','_id niveau_etude_eleve specialisation_eleve etablissement_eleve pays_etablissement debut_etablissement fin_etablissement desc_formation resultat_formation bulletin_eleve diplome_eleve')
                    .populate('eleve_langue','_id langue_eleve attestation_langue_eleve')
                    .populate('eleve_experience','_id titre_poste_eleve entreprise_eleve debut_entreprise fin_entreprise desc_poste_eleve attestation_entreprise_eleve')
                    .populate('eleve_honneur','_id titre_honneur annee_honneur description_honneur attestation_honneur')
                    .then(userhon => {
                        return res.status(200).json({ type: "success", message: 'Document modifié avec succès !', data:userhon })
                    })
                    .catch(err => {
                        return res.status(422).json({ type: "error", message: 'ERROR: ' + err })
                    })
                })
                .catch(err => {
                    return res.status(422).json({ type: "error", message: 'ERROR: ' + err })
                })
        }
    });
})

router.post('/addedit-userexperience', (req, res, next) => {
    const form = formidable({ multiples: true });
    var champs = [];
    var filese = [];
    form.on('field', function (fieldName, fieldValue) {
        champs.push({ key: fieldName, value: fieldValue });
    });
    form.on('file', function (field, file) {
        filese.push({ field: field, file: file });
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
                var newpath = 'public/uploads/imageupload' + new Date().getTime() + i + "." + element.file.type.split('/')[1];
                fs.rename(oldpath, newpath, function (err) {
                    // if (err) throw err;
                    // console.log("Image uploaded at this path: "+newpath);
                });
                newpath = newpath.split("public/")[1];
                uploadedFile.push({ key: element.field, value: "/" + newpath });
            } else {
                if (fields.id_doc == "no") {
                    uploadedFile.push({ key: element.field, value: "/" });
                }
            }
        })
        function filtrage(params, type) {
            var filteredArray = [];
            if (type == "field") {
                filteredArray = champs.filter(champ => champ.key == params);
            } else {
                filteredArray = uploadedFile.filter(champ => champ.key == params);
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
            if (element.key != "id_experience") {
                filtrage(element.key, "field");
            }
        });
        uploadedFile.forEach(element => {
            switch (element.key) {
                case "attestation_entreprise_eleve":
                    filtrage("attestation_entreprise_eleve", "file");
                    break;
                default:
                    break;
            }
        })
        var docc = new UserExperience(category_data)
        if (fields.id_experience == "no") {
            docc.save().then(result => {
                User.findOne({ _id: fields.user_id })
                .populate('eleve_education','_id niveau_etude_eleve specialisation_eleve etablissement_eleve pays_etablissement debut_etablissement fin_etablissement desc_formation resultat_formation bulletin_eleve diplome_eleve')
                .populate('eleve_langue','_id langue_eleve attestation_langue_eleve')
                .populate('eleve_experience','_id titre_poste_eleve entreprise_eleve debut_entreprise fin_entreprise desc_poste_eleve attestation_entreprise_eleve')
                .populate('eleve_honneur','_id titre_honneur annee_honneur description_honneur attestation_honneur')
                .then(userhon => {
                    userhon.eleve_experience.push(result._id);
                    userhon.save();
                    return res.status(200).json({ type: "success", message: 'Document crée avec succès !', data:userhon })
                })
                .catch(err => {
                    return res.status(422).json({ type: "error", message: 'ERROR: ' + err })
                })
            })
        } else {
            var searchQuery = { _id: fields.id_experience }
            UserExperience.updateOne(searchQuery, {
                $set: category_data
            })
                .then(result => {
                    User.findOne({ _id: fields.user_id })
                    .populate('eleve_education','_id niveau_etude_eleve specialisation_eleve etablissement_eleve pays_etablissement debut_etablissement fin_etablissement desc_formation resultat_formation bulletin_eleve diplome_eleve')
                    .populate('eleve_langue','_id langue_eleve attestation_langue_eleve')
                    .populate('eleve_experience','_id titre_poste_eleve entreprise_eleve debut_entreprise fin_entreprise desc_poste_eleve attestation_entreprise_eleve')
                    .populate('eleve_honneur','_id titre_honneur annee_honneur description_honneur attestation_honneur')
                    .then(userhon => {
                        return res.status(200).json({ type: "success", message: 'Document modifié avec succès !', data:userhon })
                    })
                    .catch(err => {
                        return res.status(422).json({ type: "error", message: 'ERROR: ' + err })
                    })
                })
                .catch(err => {
                    return res.status(422).json({ type: "error", message: 'ERROR: ' + err })
                })
        }
    });
})

router.post('/addedit-userlangue', (req, res, next) => {
    const form = formidable({ multiples: true });
    var champs = [];
    var filese = [];
    form.on('field', function (fieldName, fieldValue) {
        champs.push({ key: fieldName, value: fieldValue });
    });
    form.on('file', function (field, file) {
        filese.push({ field: field, file: file });
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
                var newpath = 'public/uploads/imageupload' + new Date().getTime() + i + "." + element.file.type.split('/')[1];
                fs.rename(oldpath, newpath, function (err) {
                    // if (err) throw err;
                    // console.log("Image uploaded at this path: "+newpath);
                });
                newpath = newpath.split("public/")[1];
                uploadedFile.push({ key: element.field, value: "/" + newpath });
            } else {
                if (fields.id_doc == "no") {
                    uploadedFile.push({ key: element.field, value: "/" });
                }
            }
        })
        function filtrage(params, type) {
            var filteredArray = [];
            if (type == "field") {
                filteredArray = champs.filter(champ => champ.key == params);
            } else {
                filteredArray = uploadedFile.filter(champ => champ.key == params);
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
            if (element.key != "id_langue") {
                filtrage(element.key, "field");
            }
        });
        uploadedFile.forEach(element => {
            switch (element.key) {
                case "attestation_langue_eleve":
                    filtrage("attestation_langue_eleve", "file");
                    break;
                default:
                    break;
            }
        })
        var docc = new UserLangue(category_data)
        if (fields.id_langue == "no") {
            docc.save().then(result => {
                User.findOne({ _id: fields.user_id })
                .populate('eleve_education','_id niveau_etude_eleve specialisation_eleve etablissement_eleve pays_etablissement debut_etablissement fin_etablissement desc_formation resultat_formation bulletin_eleve diplome_eleve')
                .populate('eleve_langue','_id langue_eleve attestation_langue_eleve')
                .populate('eleve_experience','_id titre_poste_eleve entreprise_eleve debut_entreprise fin_entreprise desc_poste_eleve attestation_entreprise_eleve')
                .populate('eleve_honneur','_id titre_honneur annee_honneur description_honneur attestation_honneur')
                .then(userhon => {
                    userhon.eleve_langue.push(result._id);
                    userhon.save();
                    return res.status(200).json({ type: "success", message: 'Document crée avec succès !', data:userhon })
                })
                .catch(err => {
                    return res.status(422).json({ type: "error", message: 'ERROR: ' + err })
                })
            })
        } else {
            var searchQuery = { _id: fields.id_langue }
            UserLangue.updateOne(searchQuery, {
                $set: category_data
            })
                .then(result => {
                    User.findOne({ _id: fields.user_id })
                    .populate('eleve_education','_id niveau_etude_eleve specialisation_eleve etablissement_eleve pays_etablissement debut_etablissement fin_etablissement desc_formation resultat_formation bulletin_eleve diplome_eleve')
                    .populate('eleve_langue','_id langue_eleve attestation_langue_eleve')
                    .populate('eleve_experience','_id titre_poste_eleve entreprise_eleve debut_entreprise fin_entreprise desc_poste_eleve attestation_entreprise_eleve')
                    .populate('eleve_honneur','_id titre_honneur annee_honneur description_honneur attestation_honneur')
                    .then(userhon => {
                        return res.status(200).json({ type: "success", message: 'Document modifié avec succès !', data:userhon })
                    })
                    .catch(err => {
                        return res.status(422).json({ type: "error", message: 'ERROR: ' + err })
                    })
                })
                .catch(err => {
                    return res.status(422).json({ type: "error", message: 'ERROR: ' + err })
                })
        }
    });
})

router.post('/addedit-usereducation', (req, res, next) => {
    const form = formidable({ multiples: true });
    var champs = [];
    var filese = [];
    form.on('field', function (fieldName, fieldValue) {
        champs.push({ key: fieldName, value: fieldValue });
    });
    form.on('file', function (field, file) {
        filese.push({ field: field, file: file });
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
                var newpath = 'public/uploads/imageupload' + new Date().getTime() + i + "." + element.file.type.split('/')[1];
                fs.rename(oldpath, newpath, function (err) {
                    // if (err) throw err;
                    // console.log("Image uploaded at this path: "+newpath);
                });
                newpath = newpath.split("public/")[1];
                uploadedFile.push({ key: element.field, value: "/" + newpath });
            } else {
                if (fields.id_doc == "no") {
                    uploadedFile.push({ key: element.field, value: "/" });
                }
            }
        })
        function filtrage(params, type) {
            var filteredArray = [];
            if (type == "field") {
                filteredArray = champs.filter(champ => champ.key == params);
            } else {
                filteredArray = uploadedFile.filter(champ => champ.key == params);
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
            if (element.key != "id_education") {
                filtrage(element.key, "field");
            }
        });
        uploadedFile.forEach(element => {
            switch (element.key) {
                case "bulletin_eleve":
                    filtrage("bulletin_eleve", "file");
                    break;
                case "diplome_eleve":
                    filtrage("diplome_eleve", "file");
                    break;
                default:
                    break;
            }
        })
        var docc = new UserEducation(category_data)
        if (fields.id_education == "no") {
            docc.save().then(result => {
                User.findOne({ _id: fields.user_id })
                .populate('eleve_education','_id niveau_etude_eleve specialisation_eleve etablissement_eleve pays_etablissement debut_etablissement fin_etablissement desc_formation resultat_formation bulletin_eleve diplome_eleve')
                .populate('eleve_langue','_id langue_eleve attestation_langue_eleve')
                .populate('eleve_experience','_id titre_poste_eleve entreprise_eleve debut_entreprise fin_entreprise desc_poste_eleve attestation_entreprise_eleve')
                .populate('eleve_honneur','_id titre_honneur annee_honneur description_honneur attestation_honneur')
                .then(userhon => {
                    userhon.eleve_education.push(result._id);
                    userhon.save();
                    return res.status(200).json({ type: "success", message: 'Document crée avec succès !', data:userhon })
                })
                .catch(err => {
                    return res.status(422).json({ type: "error", message: 'ERROR: ' + err })
                })
            })
        } else {
            var searchQuery = { _id: fields.id_education }
            UserEducation.updateOne(searchQuery, {
                $set: category_data
            })
                .then(result => {
                    User.findOne({ _id: fields.user_id })
                    .populate('eleve_education','_id niveau_etude_eleve specialisation_eleve etablissement_eleve pays_etablissement debut_etablissement fin_etablissement desc_formation resultat_formation bulletin_eleve diplome_eleve')
                    .populate('eleve_langue','_id langue_eleve attestation_langue_eleve')
                    .populate('eleve_experience','_id titre_poste_eleve entreprise_eleve debut_entreprise fin_entreprise desc_poste_eleve attestation_entreprise_eleve')
                    .populate('eleve_honneur','_id titre_honneur annee_honneur description_honneur attestation_honneur')
                    .then(userhon => {
                        return res.status(200).json({ type: "success", message: 'Document modifié avec succès !', data:userhon })
                    })
                    .catch(err => {
                        return res.status(422).json({ type: "error", message: 'ERROR: ' + err })
                    })
                })
                .catch(err => {
                    return res.status(422).json({ type: "error", message: 'ERROR: ' + err })
                })
        }
    });
})

module.exports = router