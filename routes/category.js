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
const Category = require('../models/categoryModel')

//Checks if user is authenticated
function isAuthenticatedUser(req, res, next) {
    if (req.isAuthenticated()) {
        return next()
    }
    req.flash('error_msg', 'Veuillez vous connecter pour accéder à cette page.')
    res.redirect('/login')
}

////////////////===== GET ROUTES =====////////////////

router.get('/dashboard/categories', isAuthenticatedUser, (req, res) => {
    Category.find({})
        .sort({ createdAt: -1 })
        .then(lang => {
            res.render('./blog_category/index', { page: "Liste des catégories", username: req.user.name, user_admin_id: req.user._id,  menu: "categorie", users: lang })
        })
        .catch(err => {
            console.log(err)
        })
})

router.get('/api/categories', (req, res) => {
    Category.find({})
        .sort({ createdAt: -1 })
        .then(lang => {
            return res.status(200).json({ type: "success", message: 'Catégories recupérées avec succès !', data:lang })
        })
        .catch(err => {
            console.log(err)
        })
})

router.get('/dashboard/categories/add', isAuthenticatedUser, (req, res) => {
    Category.find({})
        .sort({ createdAt: -1 })
        .then(lang => {
            res.render('./blog_category/add', { page: "Ajouter une catégorie", username: req.user.name, user_admin_id: req.user._id,  menu: "categorie", lang })
        })
        .catch(err => {
            console.log(err)
        })
})

router.get('/dashboard/categories/edit/:id', isAuthenticatedUser, (req, res) => {
    let searchQuery = { _id: req.params.id }

    Category.findOne(searchQuery)
        .then(categorie => {
            res.render('./blog_category/edit', { categorie, page: "Modifier une catégorie", username: req.user.name, user_admin_id: req.user._id,  menu: "categorie" })
        })
        .catch(err => {
            console.log(err);
            res.redirect('/dashboard/categories')
        })
})

router.get('/dashboard/categories/delete/:id', isAuthenticatedUser, (req, res) => {
    let searchQuery = { _id: req.params.id }

    Category.deleteOne(searchQuery)
        .then(lang => {
            return res.status(200).json({ type: "success", message: 'Formation supprimée avec succès !' })
        })
        .catch(err => {
            console.log(err);
            return res.status(200).json({ type: "error", message: 'Erreur '+err })
        })
})

////////////////===== POST ROUTES =====////////////////

router.post('/addedit-categorie', (req, res, next) => {
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
            if (element.key != "id_category") {
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
        var formation = new Category(category_data)
        if (fields.id_category == "no") {
            formation.save().then(result => {
                return res.status(200).json({ type: "success", message: 'Catégorie créee avec succès !', result })
            })
        } else {
            var searchQuery = { _id: fields.id_category }
            Category.updateOne(searchQuery, {
                $set: category_data
            })
                .then(result => {
                    return res.status(200).json({ type: "success", message: 'Catégorie modifiée avec succès !', result })
                })
                .catch(err => {
                    return res.status(422).json({ type: "error", message: 'ERROR: ' + err })
                })
        }
    });
})

module.exports = router