const Sauce = require('../models/Sauce.js');
const asyncHandler = require('express-async-handler');
const fs = require('fs');
const { checkPrime } = require('crypto');

// Middleware GET qui va chercher toutes les sauces de la base de données pour les afficher
exports.getAllSauces = (req, res, next) => {
    Sauce.find()
        .then(sauces => res.status(200).json(sauces))
        .catch(error => res.status(400).json({ message: "Une erreur est survenue lors de l'affichage des sauces !", error }));
};

// Middleware GET qui va rechercher une sauce de manière dynamique avec son id
exports.getOneSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
        .then(sauces => res.status(200).json(sauces))
        .catch(error => res.status(404).json({ message: "Une erreur est survenue lors de l'affichage de la sauce sélectionnée !", error }));
};

// Middleware POST qui permet d'enregistrer des sauces dans la base de donnée en utilisant le schéma crée dans Sauce.js
exports.createSauce = asyncHandler(async (req, res) => {
    const sauceObject = JSON.parse(req.body.sauce);
    delete sauceObject._id;
    try {
        const sauce = await new Sauce({
            ...sauceObject,
            userId: req.reqdata.userId,
            imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
            likes: 0,
            dislikes: 0,
            usersLiked: [],
            usersDisliked: [],
        });
        await sauce.save()
        return res.status(201).json({ message: 'Sauce enregistrée !' })

    } catch (error) {
        return res.status(400).json({ message: 'Une erreur est survenue lors de la création de la sauce !', error })
    }
});

// Middleware PUT qui permet la modification d'une sauce
exports.modifySauce = (req, res, next) => {
    if (req.file) {
        Sauce.findOne({ _id: req.params.id })
            .then(sauce => {
                const filename = sauce.imageUrl.split('/images/')[1];
                fs.unlink(`images/${filename}`, () => { });
            })
            .catch(error => res.status(404).json({ message: "Une erreur est survenue lors de la suppression de l'image précédente !", error }));
    }
    const sauceObject = req.file ? {
        ...JSON.parse(req.body.sauce),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : { ...req.body };
    Sauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id })
        .then(() => res.status(200).json({ message: 'Sauce modifiée !' }))
        .catch(error => res.status(400).json({ message: 'Une erreur est survenue lors de la modification de la sauce !', error }));
};

// Middleware DELETE pour la suppression d'une sauce
exports.deleteSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
        .then(sauce => {
            const filename = sauce.imageUrl.split('/images/')[1];
            fs.unlink(`images/${filename}`, () => {
                sauce.deleteOne({ _id: req.params.id })
                    .then(() => res.status(200).json({ message: 'Sauce supprimée !' }))
                    .catch(error => res.status(400).json({ message: 'Une erreur est survenue lors de la suppression de la sauce !', error }));
            });
        })
        .catch(error => res.status(500).json({ error }));
};


// fonction pour ajouter et supprimer les liker / dislike
exports.judgeSauce = (req, res, next) => {

    Sauce.findOne({_id: req.params.id})  // On renvoi le schema correspondant à l'id dans notre url
    .then(sauce => { 
        const like = req.body.like; // on injecte notre caractéristique de like dans une const like
        const user = req.body.userId; // on injecte l'id de l'userde la sauce dans notre const user
        // Si l'utilisateur like la sauce
        if (like === 1) {
            if (!sauce.usersLiked.includes(user)) { // Si l'user n'est pas déjà compris dans le tableau
                sauce.likes++;  // On incrémente un +1 a notre sauce
                sauce.usersLiked.push(user); // On push l'id de l'user qui vient de liker
            }
        }
        // Si l'utilisateur dislike la sauce
        if (like === -1) {
            if (!sauce.usersDisliked.includes(user)) {
                sauce.dislikes++;
                sauce.usersDisliked.push(user);
            }
        }
        // Si l'utilisateur retire son évaluation
        if (like === 0) {
            // S'il retire un like
            if (sauce.usersLiked.includes(user)) {
                sauce.likes--;
                const index = sauce.usersLiked.indexOf(user);
                sauce.usersLiked.splice(index, 1);
            }
            // S'il retire un dislike
            if (sauce.usersDisliked.includes(user)) {
                sauce.dislikes--;
                const index = sauce.usersDisliked.indexOf(user); // renvoi le premier utilisateur trouvé correspondant
                sauce.usersDisliked.splice(index, 1); // A la position ou été notre id d'user, on le retire
            }
        }
        // On sauvegarde les changements dans la base de données
        Sauce.updateOne(
            {_id: req.params.id},
            {
            likes: sauce.likes,
            dislikes: sauce.dislikes,
            usersLiked: sauce.usersLiked,
            usersDisliked: sauce.usersDisliked,
            _id: req.params.id
            }
        )
        .then(()=> res.status(200).json({message: "L'évaluation de la sauce a bien été mise à jour !"}))
        .catch(error => res.status(400).json({error}));
    })
    .catch(error => res.status(404).json({error}));
};

