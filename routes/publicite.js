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
const Publicite = require('../models/publiciteModel')

//Checks if user is authenticated
function isAuthenticatedUser(req, res, next) {
    if (req.isAuthenticated()) {
        return next()
    }
    req.flash('error_msg', 'Veuillez vous connecter pour accéder à cette page.')
    res.redirect('/login')
}

////////////////===== GET ROUTES =====////////////////

router.get('/dashboard/publicites', isAuthenticatedUser, (req, res) => {
    Publicite.find({})
        .sort({ createdAt: -1 })
        .then(lang => {
            res.render('./publicites/index', { page: "Liste des publicités", username: req.user.name, user_admin_id: req.user._id,  menu: "publicites", users: lang })
        })
        .catch(err => {
            console.log(err)
        })
})

router.get('/api/publicites', (req, res) => {
    Publicite.find({})
        .sort({ createdAt: -1 })
        .then(lang => {
            return res.status(200).json({ type: "success", message: 'Publicitées recupérées avec succès !', data:lang })
        })
        .catch(err => {
            console.log(err)
        })
})

router.get('/dashboard/publicites/add', isAuthenticatedUser, (req, res) => {
    Publicite.find({})
        .sort({ createdAt: -1 })
        .then(lang => {
            res.render('./publicites/add', { page: "Ajouter une publicité", username: req.user.name, user_admin_id: req.user._id,  menu: "publicites", lang })
        })
        .catch(err => {
            console.log(err)
        })
})

router.get('/dashboard/publicites/edit/:id', isAuthenticatedUser, (req, res) => {
    let searchQuery = { _id: req.params.id }

    Publicite.findOne(searchQuery)
        .then(categorie => {
            res.render('./publicites/edit', { categorie, page: "Modifier une publicité", username: req.user.name, user_admin_id: req.user._id,  menu: "publicites" })
        })
        .catch(err => {
            console.log(err);
            res.redirect('/dashboard/publicites')
        })
})

router.get('/dashboard/publicites/delete/:id', isAuthenticatedUser, (req, res) => {
    let searchQuery = { _id: req.params.id }

    Publicite.deleteOne(searchQuery)
        .then(lang => {
            return res.status(200).json({ type: "success", message: 'Publicité supprimée avec succès !' })
        })
        .catch(err => {
            console.log(err);
            return res.status(200).json({ type: "error", message: 'Erreur '+err })
        })
})

////////////////===== POST ROUTES =====////////////////

router.post('/addedit-publicites', (req, res, next) => {
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
            if (element.key != "id_publicite") {
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
        var formation = new Publicite(category_data)
        if (fields.id_publicite == "no") {
            formation.save().then(result => {
                return res.status(200).json({ type: "success", message: 'Publicité créee avec succès !', result })
            })
        } else {
            var searchQuery = { _id: fields.id_publicite }
            Publicite.updateOne(searchQuery, {
                $set: category_data
            })
                .then(result => {
                    return res.status(200).json({ type: "success", message: 'Publicité modifiée avec succès !', result })
                })
                .catch(err => {
                    return res.status(422).json({ type: "error", message: 'ERROR: ' + err })
                })
        }
    });
})

module.exports = router