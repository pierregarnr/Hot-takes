//Parametres
const express = require('express'); // Framework pour le développement du serveur
const mongoose = require('mongoose'); // Bibliothèque ODM pour la création des schémas
const path = require('path'); // Module NodeJS pour la gestion des chemins d'accès à des fichiers

const app = express();

const bodyParser = require('body-parser'); // Analysez les corps de requête entrants dans un middleware avant vos gestionnaires, disponibles sous la req.bodypropriété.
const rateLimit = require('express-rate-limit'); // Pour s'assurer qu'une série de fonctions sont appelées avec un intervalle minimum entre chaque invocation.
require('dotenv').config();
const mongoSanitize = require('express-mongo-sanitize');// nettoie les données fournies par l'utilisateur pour empêcher l'injection d'opérateur MongoDB
const cookieParser = require('cookie-parser'); // Analyse les cookies
const emailValidator = require("email-validator"); // Module pour valider une adresse e-mail
const hpp = require('hpp');


const userRoutes = require('./routes/user');
const saucesRoutes = require('./routes/sauces');

// Applique une limite à toutes les requêtes
const limiter = rateLimit({
    windowMs: 30 * 60 * 1000, // 30 minutes
    max: 200, // Limite chaque IP à 200 requêtes par 'fenêtre' (ici, pour 30 minutes)
});

// Connection de notre application à notre base de données mongoAtlas grâce à une fonctionnalité mongoose
mongoose.connect( process.env.MONGO_DB ,
    { useNewUrlParser: true,
      useUnifiedTopology: true })
.then(() => console.log('Connexion à MongoDB réussie !'))
.catch(() => console.log('Connexion à MongoDB échouée !'));

// Règles de sécurité CORS
app.use((req, res, next) => {
    // Accéder à notre API depuis n'importe quelle origine ( '*' )
    res.setHeader('Access-Control-Allow-Origin', '*');
    // Ajouter les headers mentionnés aux requêtes envoyées vers notre API (Origin , X-Requested-With , etc.)
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    // Envoyer des requêtes avec les méthodes mentionnées ( GET ,POST , etc.)
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
});

// Gestion de l'erreur lors du signup
function logErrors(err, req, res, next) {
    res.status(500).send("Merci de renseigner un mot assez fort (5 mots minimums, 1 majuscule, 1 chiffre et pas d'espace)");
    next();
  }

// attribution de nos middleware a une route specifique de notre app
app.use(express.json());

app.use(limiter);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(mongoSanitize());
app.use(cookieParser());
emailValidator.validate("test@email.com");
app.use(hpp());

app.use('/images', express.static(path.join(__dirname, 'images')));
app.use('/api/auth', userRoutes)
app.use(logErrors)
app.use('/api/sauces', saucesRoutes);

module.exports = app;