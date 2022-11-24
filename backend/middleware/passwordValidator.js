const passwordValidator = require('password-validator'); // Valide un mdp selon des spécifications
// Création d'un schéma pour les mots de passe
const schema = new passwordValidator();

// Définition des règles pour les mots de passe
schema
.is().min(8)                             // Taille minimum de 8
.is().max(50)                           // Taille maximum de 50
.has().uppercase()                     // Doit comporter des minuscules
.has().lowercase()                    // Doit comporter des majuscules
.has().digits(1)                     // Doit comporter au moins un chiffre
.has().not().spaces()               // Ne doit pas comporter d'espace

module.exports = (req,res,next) => {
    if(schema .validate(req.body.password)) {
        next ();
    } else {
        return res
        .status(400)
        .json({error : "le mot de passe n'est pas assez fort, voici ce qu'il manque : " + schema.validate(password, { list: true })})
    };
}