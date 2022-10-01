const express = require('express')
const router = express.Router()
const passport = require('passport')
const crypto = require('crypto')
const async = require('async')
const nodemailer = require('nodemailer')
const formidable = require('formidable')
var fs = require('fs');

//Requiring user model
const Category = require('../models/categoryModel')
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

router.get('/dashboard/blog', isAuthenticatedUser, (req, res) => {
    Blog.find({})
        .sort({ createdAt: -1 })
        .then(lang => {
            res.render('./blog/index', { page: "Liste des articles", username: req.user.name, user_admin_id: req.user._id,  menu: "blog", users: lang })
        })
        .catch(err => {
            console.log(err)
        })
})

router.get('/api/blog', (req, res) => {
    Blog.find({status:true})
        .populate('user_id','_id name')
        .populate('comments','_id name')
        .populate('category','_id name name_en slug')
        .sort({ createdAt: -1 })
        .then(lang => {
            return res.status(200).json({ type: "success", message: 'Articles recupérés avec succès !', data:lang })
        })
        .catch(err => {
            console.log(err)
        })
})

router.get('/api/blog/:slug', (req, res) => {
    Blog.findOne({status:true,slug:req.params.slug})
        .populate('user_id','_id name')
        .populate('category','_id name name_en slug')
        .populate({ path: 'comments', populate: { path: 'user_id' } })
        .sort({ createdAt: -1 })
            .then(lang => {
                console.log(lang);
                Blog.updateOne({ _id: lang._id }, {
                    $set: {
                        vue: parseInt(lang.vue)+1
                    }
                })
                    .then(lange => {
                    return res.status(200).json({ type: "success", message: 'Article recupéré avec succès !', data:lang })
                })
                .catch(err => {
                    console.log(err);
                    return res.status(200).json({ type: "error", message: 'Erreur ' + err })
                })
        })
        .catch(err => {
            console.log(err)
        })
})

router.get('/api/blog-cat/:slug', (req, res) => {
    var slugi = req.params.slug;
    Blog.find({status:true})
        .populate('user_id','_id name')
        .populate('category','_id name name_en slug')
        .populate({ path: 'comments', populate: { path: 'user_id' } })
        .sort({ createdAt: -1 })
        .then(lang => {
            var array_cat_blog = [];
            lang.forEach((element)=>{
                element.category.forEach((cat)=>{
                    if (cat.slug == slugi) {
                        array_cat_blog.push(element)
                    }
                })
            })
            return res.status(200).json({ type: "success", message: 'Article recupéré avec succès !', data:array_cat_blog })
        })
        .catch(err => {
            console.log(err)
        })
})

router.get('/api/blog-search/:keyword', (req, res) => {
    var keyword = req.params.keyword;
    Blog.find({status:true})
        .populate('user_id','_id name')
        .populate('category','_id name name_en slug')
        .populate({ path: 'comments', populate: { path: 'user_id' } })
        .sort({ createdAt: -1 })
        .then(lang => {
            var array_cat_blog = [];
            lang.forEach((element)=>{
                if (element.title.toLowerCase().includes(keyword.toLowerCase())) {
                    array_cat_blog.push(element)
                }
            })
            return res.status(200).json({ type: "success", message: 'Article recupéré avec succès !', data:array_cat_blog })
        })
        .catch(err => {
            console.log(err)
        })
})

router.get('/dashboard/blog/add', isAuthenticatedUser, (req, res) => {
    Blog.find({})
        .sort({ createdAt: -1 })
        .then(lang => {
            Category.find({})
                .sort({ createdAt: -1 })
                .then(categories => {
                    res.render('./blog/add', { page: "Ajouter un article", username: req.user.name, user_admin_id: req.user._id,  menu: "blog", lang, categories })
                })
                .catch(err => {
                    console.log(err)
                })
        })
        .catch(err => {
            console.log(err)
        })
})

router.get('/dashboard/blog/edit/:id', isAuthenticatedUser, (req, res) => {
    let searchQuery = { _id: req.params.id }

    Blog.findOne(searchQuery)
        .populate('category','_id name name_en')
        .then(articles => {
            Category.find({})
                .sort({ createdAt: -1 })
                .then(categories => {
                    res.render('./blog/edit', { articles, categories, page: "Modifier un article", username: req.user.name, user_admin_id: req.user._id,  menu: "blog" })
                })
                .catch(err => {
                    console.log(err)
                })
        })
        .catch(err => {
            console.log(err);
            res.redirect('/dashboard/blog')
        })
})

router.get('/dashboard/blog/delete/:id', isAuthenticatedUser, (req, res) => {
    let searchQuery = { _id: req.params.id }

    Blog.deleteOne(searchQuery)
        .then(lang => {
            return res.status(200).json({ type: "success", message: 'Article supprimée avec succès !' })
        })
        .catch(err => {
            console.log(err);
            return res.status(200).json({ type: "error", message: 'Erreur ' + err })
        })
})

////////////////===== POST AND PUT ROUTES =====////////////////

router.put('/edit-blog/:id', (req, res) => {
    let searchQuery = { _id: req.params.id }
    Blog.updateOne(searchQuery, {
        $set: {
            status: req.body.status
        }
    })
        .then(user => {
            return res.status(200).json({ message: 'Article updated successfully', user })
        })
        .catch(err => {
            return res.status(422).json({ error: err })
        })
})

router.post('/addedit-blog', (req, res, next) => {
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
                if (fields.id_eleve == "no") {
                    uploadedFile.push({ key: element.field, value: "/" });
                }
            }
        })
        function slugify(text) {
            return text.toString().toLowerCase()
                .replace(/\s+/g, '-')           // Replace spaces with -
                .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
                .replace(/\-\-+/g, '-')         // Replace multiple - with single -
                .replace(/^-+/, '')             // Trim - from start of text
                .replace(/-+$/, '');            // Trim - from end of text
        }
        function filtrage(params, type) {
            var filteredArray = [];
            if (type == "field") {
                filteredArray = champs.filter(champ => champ.key == params);
            } else {
                filteredArray = uploadedFile.filter(champ => champ.key == params);
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
            if (element.key != "id_blog") {
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
        category_data['slug'] = slugify(fields.title);
        category_data['user_id'] = req.user._id;
        // console.log(category_data);
        var formation = new Blog(category_data)
        if (fields.id_blog == "no") {
            formation.save().then(result => {
                Blog.findOne({ _id: result._id })
                .then(forma => {
                    JSON.parse(category_data.categorie).forEach((element)=>{
                        forma.category.push(element);
                        forma.save();
                    })
                    return res.status(200).json({ type: "success", message: 'Article crée avec succès !', result })
                })
                .catch(err => {
                    return res.status(422).json({ type: "error", message: 'ERROR: ' + err })
                })
            })
        } else {
            var searchQuery = { _id: fields.id_blog }
            Blog.updateOne(searchQuery, {
                $set: category_data
            })
                .then(result => {
                    Blog.findOne({ _id: fields.id_blog })
                    .then(forma => {
                        forma.category = [];
                        forma.save();
                        JSON.parse(category_data.categorie).forEach((element)=>{
                            forma.category.push(element);
                            forma.save();
                        })
                        return res.status(200).json({ type: "success", message: 'Article modifié avec succès !', result })
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