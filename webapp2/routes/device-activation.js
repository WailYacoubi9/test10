const express = require('express');
const router = express.Router();

/**
 * GET /activate
 * Page d'activation d'appareil (Device Flow)
 */
router.get('/activate', (req, res) => {
    const code = req.query.code || '';
    res.render('pages/activate', {
        title: 'Activer un appareil',
        prefilledCode: code
    });
});

/**
 * POST /activate
 * Traite le code device et redirige vers Keycloak
 */
router.post('/activate', (req, res) => {
    const userCode = req.body.user_code;

    if (!userCode) {
        return res.render('pages/activate', {
            title: 'Activer un appareil',
            error: 'Veuillez entrer un code d\'activation',
            prefilledCode: ''
        });
    }

    const formattedCode = userCode.replace(/[\s-]/g, '').toUpperCase();
    
    // Use internal URL for backend, public for redirects
    const KEYCLOAK_URL = process.env.KEYCLOAK_URL || 'http://localhost:8080';
    const REALM = process.env.REALM || 'projetcis';

    const keycloakDeviceUrl = `${KEYCLOAK_URL}/realms/${REALM}/device?user_code=${formattedCode}`;

    res.redirect(keycloakDeviceUrl);
});

module.exports = router;