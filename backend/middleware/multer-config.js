const multer = require('multer'); // gestion des telechargements de fichier, par défaut il renomme les fichiers pour eviter les conflits de noms.


// indiquer la nature et le format de nos images
const MIME_TYPES = {
    'image/jpg': 'jpg',
    'image/jpeg': 'jpg',
    'image/png': 'png'
};

// On indique l'endroit ou notre img sera enregistrée, puis on la rend unique avec date.now()
const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, 'images')
    },
    filename: (req, file, callback) => {
        const name = file.originalname.split(' ').join('_');
        const extension = MIME_TYPES[file.mimetype];
        callback(null, name + Date.now() + '.' + extension)
    }
});

module.exports = multer({ storage: storage }).single('image');