const User = require('../models/user'); // Modelo de usuario
const Post = require('../models/post'); // Modelo de posts
const Profile = require('../models/profile'); // Modelo de perfil
const Credential = require('../models/credential'); // Modelo de credenciales

exports.getUserProfileByUsername = async (req, res) => {
    try {
        const username = req.params.username;

        const credentials = await Credential.findOne({ username });

        if (!credentials) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        const user = await User.findOne({ credentials: credentials._id })
            .populate({
                path: 'followers',
                model: 'User',
                populate: {
                    path: 'credentials', // Asegúrate de que 'credentials' está referenciado correctamente en el modelo de User
                    model: 'Credential'
                }
            })
            .populate({
                path: 'following',
                model: 'User',
                populate: {
                    path: 'credentials',
                    model: 'Credential'
                }
            });

        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        const profile = await Profile.findOne({ user: credentials._id });
        const posts = await Post.find({ author: credentials._id }).sort({ createdAt: -1 });

        // Obtener la lista de seguidores y seguidos
        const followers = await Promise.all(user.followers.map(async follower => {
            const followerProfile = await Profile.findOne({ user: follower.credentials._id });
            return {
                id: follower._id,
                name: follower.name,
                lastName: follower.lastName,
                username: follower.credentials.username,
                photo: followerProfile?.photo // Aquí se añade la foto de perfil del seguidor
            };
        }));

        const following = await Promise.all(user.following.map(async followed => {
            const followedProfile = await Profile.findOne({ user: followed.credentials._id });
            return {
                id: followed._id,
                name: followed.name,
                lastName: followed.lastName,
                username: followed.credentials.username,
                photo: followedProfile?.photo // Aquí se añade la foto de perfil del seguido
            };
        }));

        res.json({
            user: {
                id: user._id,
                name: user.name,
                lastName: user.lastName,
                date: user.date,
                edad: user.edad,
                genre: user.genre,
                pais: user.pais,
                ciudad: user.ciudad,
                distrito: user.distrito,
                postal: user.postal,
                email: credentials.email,
                username: credentials.username,
                idC: credentials._id,
            },
            profile: {
                photo: profile?.photo,
                createdAt: profile?.createdAt,
            },
            posts: posts.map(post => ({
                content: post.content,
                photo: post.photo,
                createdAt: post.createdAt,
            })),
            followers, // Lista de seguidores con username
            following,  // Lista de seguidos con username
        });
    } catch (error) {
        console.log('Error al obtener el perfil:', error);
        res.status(500).json({ message: 'Error al obtener el perfil del usuario' });
    }
};



exports.getAllUsers = async (req, res) => {
    try {
        // Obtener todas las credenciales (usuarios)
        const credentials = await Credential.find();

        // Si no hay usuarios
        if (!credentials || credentials.length === 0) {
            return res.status(404).json({ message: 'No se encontraron usuarios' });
        }

        // Recorremos todas las credenciales para obtener los usuarios, perfiles y posts asociados
        const usersData = await Promise.all(credentials.map(async (credential) => {
            const user = await User.findOne({ credentials: credential._id });
            const profile = await Profile.findOne({ user: credential._id });

            return {
                user: {
                    name: user?.name,
                    lastName: user?.lastName,
                    date: user?.date,
                    edad: user?.edad,
                    genre: user?.genre,
                    pais: user?.pais,
                    ciudad: user?.ciudad,
                    distrito: user?.distrito,
                    postal: user?.postal,
                    email: credential?.email,
                    username: credential?.username,
                },
                profile: {
                    photo: profile?.photo,
                    createdAt: profile?.createdAt,
                },
            };
        }));

        // Responder con todos los usuarios, perfiles y posts
        res.json(usersData);

    } catch (error) {
        console.log('Error al obtener los usuarios:', error);
        res.status(500).json({ message: 'Error al obtener los usuarios' });
    }
};