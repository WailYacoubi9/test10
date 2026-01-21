require('dotenv').config();
const express = require('express');
const session = require('express-session');
const path = require('path');
const { initializeKeycloak } = require('./config/keycloak');
const https = require('https');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// -----------------------------------------------------
// 1) Configuration du moteur de templates
// -----------------------------------------------------
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// -----------------------------------------------------
// 2) Middlewares globaux
// -----------------------------------------------------
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// -----------------------------------------------------
// 3) Session HTTP
// -----------------------------------------------------
// Note: secure cookie sera activé seulement si HTTPS est disponible
const isHttps = process.env.USE_HTTPS !== 'false';
app.use(session({
    secret: process.env.SESSION_SECRET || require('crypto').randomBytes(32).toString('hex'),
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: isHttps,       // true pour HTTPS, false pour HTTP
        httpOnly: true,
        maxAge: 3600000        // 1 heure
    }
}));

// Rendre l'utilisateur disponible dans toutes les vues
app.use((req, res, next) => {
    res.locals.user = req.session.userinfo || null;
    res.locals.isAuthenticated = !!req.session.tokenSet;
    next();
});

// -----------------------------------------------------
// 4) Initialisation et démarrage
// -----------------------------------------------------
async function start() {
    try {
        // Initialiser le client Keycloak (via config/keycloak.js)
        const keycloakClient = await initializeKeycloak();
        app.locals.keycloakClient = keycloakClient;

        // Import des routes une fois Keycloak prêt
        const authRoutes = require('./routes/auth');
        const pageRoutes = require('./routes/pages');
        const deviceActivationRoutes = require('./routes/device-activation');  // ← AJOUTÉ

        app.use('/', authRoutes);
        app.use('/', pageRoutes);
        app.use('/', deviceActivationRoutes);  // ← AJOUTÉ

        // 404
        app.use((req, res) => {
            res.status(404).render('pages/404', {
                title: 'Page non trouvée',
                message: 'La page que vous recherchez n\'existe pas.'
            });
        });

        // Erreurs globales
        app.use((err, req, res, next) => {
            console.error('Erreur:', err);
            res.status(500).render('pages/error', {
                title: 'Erreur',
                message: err.message || 'Une erreur est survenue.'
            });
        });

        // -------------------------------------------------
        // 5) Chargement des certificats mkcert (optionnel)
        // -------------------------------------------------
        const certDir = path.join(__dirname, 'certs');
        const keyPath = path.join(certDir, 'localhost+2-key.pem');
        const certPath = path.join(certDir, 'localhost+2.pem');

        let httpsOptions;
        let useHttps = false;

        try {
            httpsOptions = {
                key: fs.readFileSync(keyPath),
                cert: fs.readFileSync(certPath)
            };
            useHttps = true;
            console.log('✓ Certificats TLS trouvés, démarrage en HTTPS');
        } catch (e) {
            console.log('⚠ Certificats TLS non trouvés, démarrage en HTTP');
            console.log('  (Normal dans Docker, utilisez HTTPS en production avec un reverse proxy)');
        }

        // -------------------------------------------------
        // 6) Démarrage du serveur HTTPS ou HTTP
        // -------------------------------------------------
        if (useHttps) {
            https.createServer(httpsOptions, app).listen(PORT, () => {
                console.log('');
                console.log('Serveur HTTPS démarré');
                console.log('--------------------------------------------');
                console.log(`URL front-end      : https://localhost:${PORT}`);
                console.log(`Keycloak (public)  : ${process.env.KEYCLOAK_URL}`);
                console.log(`Keycloak (interne) : ${process.env.KEYCLOAK_INTERNAL_URL || '(non défini)'}`);
                console.log(`Realm              : ${process.env.REALM}`);
                console.log(`Client ID          : ${process.env.CLIENT_ID}`);
                console.log(`Redirect URI       : ${process.env.REDIRECT_URI}`);
                console.log('--------------------------------------------');
                console.log('');
            });
        } else {
            app.listen(PORT, '0.0.0.0', () => {
                console.log('');
                console.log('Serveur HTTP démarré');
                console.log('--------------------------------------------');
                console.log(`URL front-end      : http://localhost:${PORT}`);
                console.log(`Keycloak (public)  : ${process.env.KEYCLOAK_URL}`);
                console.log(`Keycloak (interne) : ${process.env.KEYCLOAK_INTERNAL_URL || '(non défini)'}`);
                console.log(`Realm              : ${process.env.REALM}`);
                console.log(`Client ID          : ${process.env.CLIENT_ID}`);
                console.log(`Redirect URI       : ${process.env.REDIRECT_URI}`);
                console.log('--------------------------------------------');
                console.log('');
            });
        }

    } catch (error) {
        console.error('Erreur lors du démarrage de l\'application:', error);
        process.exit(1);
    }
}

start();