const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator'); // plugin qui ajoute une validation de pré-enregistrement pour les champs uniques dans un schéma Mongoose, 
                                                            // facilite la gestion des erreurs

// Schéma de données qui contient les champs souhaités pour chaque utilisateur
const userSchema = mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
});

userSchema.plugin(uniqueValidator);

module.exports = mongoose.model('User', userSchema);