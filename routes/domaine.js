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
const Domaine = require('../models/domaineModel')

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

router.get('/dashboard/domaines', isAuthenticatedUser, (req, res) => {
    Domaine.find({})
        .sort({ createdAt: -1 })
        .then(lang => {
            res.render('./domaines/index', { page: "Liste des domaines", username: req.user.name, user_admin_id: req.user._id,  menu: "formation", users: lang })
        })
        .catch(err => {
            console.log(err)
        })
})

router.get('/api/domaines', (req, res) => {
    Domaine.find()
        .sort({ name: 1})
        .then(lang => {
            console.log("les categories");
            console.log(lang);
            const sorted = lang.sort((x, y) => sortByName(x, y))
            console.log('sorted data ', sorted);
            return res.status(200).json({ type: "success", message: 'Domaines recupérés avec succès !', data:sorted })
        })
        .catch(err => {
            console.log(err)
        })
})

router.get('/dashboard/domaines/add', isAuthenticatedUser, (req, res) => {
    Domaine.find({})
        .sort({ createdAt: -1 })
        .then(lang => {
            res.render('./domaines/add', { page: "Ajouter un domaine", username: req.user.name, user_admin_id: req.user._id,  menu: "formation", lang })
        })
        .catch(err => {
            console.log(err)
        })
})

router.get('/dashboard/domaines/edit/:id', isAuthenticatedUser, (req, res) => {
    let searchQuery = { _id: req.params.id }

    Domaine.findOne(searchQuery)
        .then(categorie => {
            res.render('./domaines/edit', { categorie, page: "Modifier un domaine", username: req.user.name, user_admin_id: req.user._id,  menu: "formation" })
        })
        .catch(err => {
            console.log(err);
            res.redirect('/dashboard/domaines')
        })
})

router.get('/dashboard/domaines/delete/:id', isAuthenticatedUser, (req, res) => {
    let searchQuery = { _id: req.params.id }

    Domaine.deleteOne(searchQuery)
        .then(lang => {
            return res.status(200).json({ type: "success", message: 'Domaine supprimé avec succès !' })
        })
        .catch(err => {
            console.log(err);
            return res.status(200).json({ type: "error", message: 'Erreur '+err })
        })
})

////////////////===== POST ROUTES =====////////////////

router.post('/addedit-domaine', (req, res, next) => {
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
                if(fields.id_eleve == "no"){
                    uploadedFile.push({key:element.field,value:"/"});
                }
            }
        }) 
        function slugify(text)
        {
            return text.toString().toLowerCase()
                .replace(/\s+/g, '-')           // Replace spaces with -
                .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
                .replace(/\-\-+/g, '-')         // Replace multiple - with single -
                .replace(/^-+/, '')             // Trim - from start of text
                .replace(/-+$/, '');            // Trim - from end of text
        }
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
            if (element.key != "id_domaine") {
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
        category_data['slug'] = slugify(fields.name);
        // console.log(category_data);
        var formation = new Domaine(category_data)
        if (fields.id_domaine == "no") {
            formation.save().then(result => {
                return res.status(200).json({ type: "success", message: 'Domaine crée avec succès !', result })
            })
        } else {
            var searchQuery = { _id: fields.id_domaine }
            Domaine.updateOne(searchQuery, {
                $set: category_data
            })
                .then(result => {
                    return res.status(200).json({ type: "success", message: 'Domaine modifié avec succès !', result })
                })
                .catch(err => {
                    return res.status(422).json({ type: "error", message: 'ERROR: ' + err })
                })
        }
    });
})

module.exports = router