const admin = require('firebase-admin')
const serviceAccount = require('./firebase-admin.json')


admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: 'your-project-id.appspot.com' // Reemplaza con el ID de tu bucket de Firebase
  });
  