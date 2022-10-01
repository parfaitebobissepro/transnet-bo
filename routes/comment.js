const express = require('express')
const router = express.Router()
const passport = require('passport')
const crypto = require('crypto')
const async = require('async')
const nodemailer = require('nodemailer')
const formidable = require('formidable')
var fs = require('fs');

//Requiring user model
const Comment = require('../models/commentModel')
const Blog = require('../models/blogModel')

//Checks if user is authenticated
function isAuthenticatedUser(req, res, next) {
    if (req.isAuthenticated()) {
        return next()
    }
    req.flash('error_msg', 'Veuillez vous connecter pour accéder à cette page.')
    res.redirect('/login')
}

////////////////===== GET ROUTES =====////////////////

router.get('/dashboard/comment', isAuthenticatedUser, (req, res) => {
    Comment.find({})
        .populate('blog_id','_id title')
        .sort({ createdAt: -1 })
        .then(lang => {
            res.render('./commentaires/index', { page: "Liste des commentaires", username: req.user.name, user_admin_id: req.user._id,  menu: "comment", users: lang })
        })
        .catch(err => {
            console.log(err)
        })
})

router.get('/api/last-comments', (req, res) => {
    Comment.find({})
        .populate('blog_id','_id title slug image')
        .populate('user_id','_id name pic logo_ecole type nom_ecole')
        .sort({ createdAt: -1 })
        .limit(5)
        .then(lang => {
            return res.status(200).json({ type: "success", message: 'Commentaires recupérés avec succès !', data:lang })
        })
        .catch(err => {
            console.log(err)
        })
})

router.get('/api/comments/:id', (req, res) => {
    let searchQuery = { blog_id: req.params.id }
    Comment.find(searchQuery)
        .populate('blog_id','_id title')
        .populate('user_id','_id name pic logo_ecole type nom_ecole')
        .sort({ createdAt: -1 })
        .then(lang => {
            return res.status(200).json({ type: "success", message: 'Commentaires recupérés avec succès !', data:lang })
        })
        .catch(err => {
            console.log(err)
        })
})

router.get('/dashboard/comment/delete/:id', isAuthenticatedUser, (req, res) => {
    let searchQuery = { _id: req.params.id }

    Comment.deleteOne(searchQuery)
        .then(lang => {
            return res.status(200).json({ type: "success", message: 'Commentaire supprimée avec succès !' })
        })
        .catch(err => {
            console.log(err);
            return res.status(200).json({ type: "error", message: 'Erreur '+err })
        })
})

////////////////===== POST ROUTES =====////////////////

router.post('/comment-universcity', (req, res, next) => {
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
        // console.log(category_data);
        var comment = new Comment(category_data)
        comment.save().then(result => {
            var search = {_id: result._id};
            Comment.findOne(search)
                .populate('blog_id','_id title slug image')
                .populate('user_id','_id name pic logo_ecole type nom_ecole')
                .sort({ createdAt: -1 })
                .then(lang => {
                    Blog.findOne({ _id: lang.blog_id._id })
                    .then(bloge => {
                        bloge.comments.push(result._id);
                        bloge.save();
                        return res.status(200).json({ type: "success", message: fields.lang == "en" ? 'Comment sent successfully !' : 'Commentaire envoyé avec succès !', data:lang })
                    })
                    .catch(err => {
                        return res.status(422).json({ type: "error", message: 'ERROR: ' + err })
                    })
                })
                .catch(err => {
                    console.log(err)
                })
        })

    });
})


module.exports = router