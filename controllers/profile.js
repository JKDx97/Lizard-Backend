const Profile = require('../models/profile');
const Credential = require('../models/credential');
const { Storage } = require('@google-cloud/storage');
const path = require('path');
require('dotenv').config();

// Inicializar Firebase Storage
const fileName = path.resolve(process.env.FIREBASE_KEY_PATH);
const storageBucket = new Storage({
    projectId: process.env.FIREBASE_PROJECT_ID,
    keyFilename: fileName
});
const bucket = storageBucket.bucket(process.env.FIREBASE_BUCKET_NAME);

exports.uploadPhotoProfile = async (req, res) => {
    try {
        const userId = req.body.userId; // ID del usuario que sube la foto
        const file = req.file; // Imagen enviada en la solicitud

        if (!file) {
            return res.status(400).send('No file uploaded.');
        }

        // Crear un nombre único para el archivo
        const filename = `profile_photos/${userId}-${Date.now()}-${file.originalname}`;
        const blob = bucket.file(filename);
        const blobStream = blob.createWriteStream({
            resumable: false,
        });

        // Subir el archivo a Firebase Storage
        blobStream.on('error', (err) => {
            res.status(500).send({ message: 'Unable to upload image.', error: err });
        });

        blobStream.on('finish', async () => {
            try {
                // Guardar solo el nombre del archivo en la base de datos
                let profile = await Profile.findOne({ user: userId });
                if (!profile) {
                    profile = new Profile({ user: userId, photo: filename });
                } else {
                    profile.photo = filename;
                }
                await profile.save();
                const credential = await Credential.findById(userId);
                if (!credential) {
                    return res.status(404).send({ message: 'User not found.' });
                }
                credential.profile = profile._id; // Vincular el perfil al usuario
                await credential.save();
                req.io.emit('newProfile', profile);

                res.status(200).send({ message: 'Profile photo uploaded successfully', fileName: filename ,profileId: profile._id });
            } catch (error) {
                res.status(500).send({ message: 'Error saving profile photo.', error });
            }
        });

        blobStream.end(file.buffer);
    } catch (error) {
        res.status(500).send({ message: 'Error uploading profile photo', error });
    }
};


exports.getProfile = async (req, res) => {
    const { userId } = req.params;
  
    try {
      const profile = await Profile.find({ user: userId }).populate('user', 'username email');
      res.status(200).json(profile);
    } catch (error) {
    }
  };