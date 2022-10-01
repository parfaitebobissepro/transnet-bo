const express = require('express')
const router = express.Router()
const passport = require('passport')
const crypto = require('crypto')
const async = require('async')
const nodemailer = require('nodemailer')
const formidable = require('formidable')
var fs = require('fs');

//Requiring user model
const Doc = require('../models/docModel')
const Formation = require('../models/formationModel')
const Commande = require('../models/commandeModel')

//Checks if user is authenticated
function isAuthenticatedUser(req, res, next) {
    if (req.isAuthenticated()) {
        return next()
    }
    req.flash('error_msg', 'Veuillez vous connecter pour accéder à cette page.')
    res.redirect('/login')
}

////////////////===== GET ROUTES =====////////////////

router.get('/dashboard/docs', isAuthenticatedUser, (req, res) => {
    Doc.find({})
        .sort({ createdAt: -1 })
        .then(lang => {
            res.render('./doc/index', { page: "Liste des documents", username: req.user.name, user_admin_id: req.user._id,  menu: "doc", users: lang })
        })
        .catch(err => {
            console.log(err)
        })
})

router.get('/dashboard/docs/add', isAuthenticatedUser, (req, res) => {
    res.render('./doc/add', { page: "Ajouter un document", username: req.user.name, user_admin_id: req.user._id,  menu: "doc" })
})

router.get('/dashboard/docs/edit/:id', isAuthenticatedUser, (req, res) => {
    let searchQuery = { _id: req.params.id }

    Doc.findOne(searchQuery)
        .then(lang => {
            res.render('./doc/edit', { doc:lang, page: "Modifier un document", username: req.user.name, user_admin_id: req.user._id,  menu: "doc" })
        })
        .catch(err => {
            console.log(err);
            res.redirect('/dashboard/docs')
        })
})

router.get('/api/docs_user/:id', (req, res) => {
    // let searchQuery = { _id: req.params.id }
    Commande.find({user_id:req.params.id,statut:"Payé"})
        .sort({ createdAt: -1 })
        .then(cmd => {
            if (cmd.length > 0) {
                Doc.find({})
                    .sort({ createdAt: -1 })
                    .then(lang => {
                        res.status(200).json({ type:"success", message: "Document récuperé avec succès !", data:lang })
                    })
                    .catch(err => {
                        console.log(err);
                        // res.redirect('/dashboard/docs')
                    })
            }else{
                res.status(200).json({ type:"error", message: "Document non récuperée, souscrivez à un pack !", data:"" })
            }
        })
        .catch(err => {
            console.log(err);
            // res.redirect('/dashboard/docs')
        })
})

router.get('/dashboard/langues/delete/:id', isAuthenticatedUser, (req, res) => {
    let searchQuery = { _id: req.params.id }

    Langue.deleteOne(searchQuery)
        .then(lang => {
            return res.status(200).json({ type: "success", message: 'Langue supprimée avec succès !' })
        })
        .catch(err => {
            console.log(err);
            return res.status(200).json({ type: "error", message: 'Erreur '+err })
        })
})

////////////////===== POST ROUTES =====////////////////

router.put('/edit-doc-activate/:id', (req, res) => {
    let searchQuery = { _id: req.params.id }
    Doc.updateOne(searchQuery, {
        $set: {
            active: req.body.active
        }
    })
        .then(user => {
            return res.status(200).json({ message: 'Document updated successfully', user })
        })
        .catch(err => {
            return res.status(422).json({ error: err })
        })
})

router.post('/addedit-doc', (req, res, next) => {
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
            if (element.key != "id_doc") {
                filtrage(element.key, "field");
            }
        });
        uploadedFile.forEach(element => {
            switch (element.key) {
                case "url":
                    filtrage("url", "file");
                    break;
                default:
                    break;
            }
        })
        var docc = new Doc(category_data)
        if (fields.id_doc == "no") {
            docc.save().then(result => {
                return res.status(200).json({ type: "success", message: 'Document crée avec succès !', result })
            })
        } else {
            var searchQuery = { _id: fields.id_doc }
            Doc.updateOne(searchQuery, {
                $set: category_data
            })
                .then(result => {
                    return res.status(200).json({ type: "success", message: 'Document modifié avec succès !', result })
                })
                .catch(err => {
                    return res.status(422).json({ type: "error", message: 'ERROR: ' + err })
                })
        }
    });
})

module.exports = router