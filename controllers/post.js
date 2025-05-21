const Post = require('../models/post');
const Like = require('../models/like')
const Credential = require('../models/credential');
const { Storage } = require('@google-cloud/storage');
const path = require('path');
const Profile = require('../models/profile')
require('dotenv').config();

// Inicializar Firebase Storage
const fileName = path.resolve(process.env.FIREBASE_KEY_PATH);
const storageBucket = new Storage({
    projectId: process.env.FIREBASE_PROJECT_ID,
    keyFilename: fileName
});
const bucket = storageBucket.bucket(process.env.FIREBASE_BUCKET_NAME);

// Crear un nuevo post
exports.createPost = async (req, res) => {
    try {
        const file = req.file; // Suponiendo que utilizas multer para manejar archivos
        const { content, authorId } = req.body;

        // Buscar la credencial del autor (usuario) por ID
        const author = await Credential.findById(authorId);
        if (!author) {
            return res.status(404).json({ message: 'Autor no encontrado' });
        }

        let photoFileName = null;

        // Subir la imagen a Firebase Storage si existe
        if (file) {
            const filename = `${Date.now()}-${path.basename(file.originalname)}`;
            const fileUpload = bucket.file(filename);
            const stream = fileUpload.createWriteStream({
                metadata: {
                    contentType: file.mimetype,
                },
            });

            // Manejar errores al subir la imagen
            stream.on('error', (err) => {
                console.error('Error al subir el archivo a Firebase Storage', err);
                return res.status(500).send('Error al subir el archivo');
            });

            // Finalizar la subida y continuar con la creación del post
            stream.on('finish', async () => {
                try {
                    // Guardar solo el nombre del archivo en la base de datos
                    photoFileName = filename;

                    // Crear el nuevo post con la referencia al autor y el nombre del archivo de la imagen
                    const newPost = new Post({
                        content,
                        photo: photoFileName, // Guarda solo el nombre del archivo
                        author: author._id, // Usamos el ID de la credencial del usuario
                    });

                    await newPost.save();
                    req.io.emit('newPost', await newPost.populate('author', 'username'));
                    res.status(201).json(newPost);
                } catch (error) {
                    console.error('Error al crear el post', error);
                    res.status(500).send('Error al crear el post');
                }
            });

            // Iniciar la subida
            stream.end(file.buffer);
        } else {
            // Si no hay archivo, se crea el post sin foto
            const newPost = new Post({
                content,
                author: author._id,
            });

            await newPost.save();
            req.io.emit('newPost', await newPost.populate('author', 'username'));
            res.status(201).json(newPost);
        }
    } catch (error) {
        console.error('Error en el controlador createPost', error);
        res.status(500).send('Error interno del servidor');
    }
};


// Obtener los posts del usuario autenticado
exports.getPostsByUser = async (req, res) => {
    const { authorId } = req.params;
    const userId = req.userId; // Utiliza solo req.userId para evitar errores

    try {
        const posts = await Post.find({ author: authorId })
            .populate('author', 'username email')
            .sort({ createdAt: -1 });

        const postsWithLikes = await Promise.all(posts.map(async (post) => {
            const likesCount = await Like.countDocuments({ post: post._id });
            const userHasLiked = await Like.exists({ post: post._id, user: userId });
            return {
                ...post.toObject(),
                likesCount,


                userHasLiked: !!userHasLiked
            };
        }));

        res.status(200).json(postsWithLikes);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener los posts del usuario', error });
    }
};

exports.getRandomPosts = async (req, res) => {
    const userId = req.userId; // Usa solo req.userId

    try {
        const { limit, offset } = req.query;
        const postLimit = parseInt(limit) || 10;
        const postOffset = parseInt(offset) || 0;

        const posts = await Post.find()
            .populate('author', 'username email')
            .sort({ createdAt: -1 })
            .skip(postOffset)
            .limit(postLimit);

        const postsWithLikes = await Promise.all(posts.map(async (post) => {
            const likesCount = await Like.countDocuments({ post: post._id });
            const userHasLiked = await Like.exists({ post: post._id, user: userId });
            const profile = await Profile.findOne({ user: post.author._id }).select('photo');
            return {
                ...post.toObject(),
                profilePhoto: profile ? profile.photo : null,
                likesCount,
                userHasLiked: !!userHasLiked
            };
        }));

        const shuffledPosts = postsWithLikes.sort(() => Math.random() - 0.5);
        res.status(200).json(shuffledPosts);
    } catch (error) {
        console.error('Error al obtener los posts aleatorios', error);
        res.status(500).json({ message: 'Error al obtener los posts aleatorios', error });
    }
};