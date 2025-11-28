const express = require('express');
const { requireAuth, refreshTokenIfNeeded } = require('../middleware/auth');

const router = express.Router();

/**
 * GET /
 * Page d'accueil
 */
router.get('/', (req, res) => {
    res.render('pages/home', {
        title: 'Accueil - Projet CIS'
    });
});

/**
 * GET /profile
 * Page de profil utilisateur (protégée)
 * Le refresh token sera automatiquement vérifié et renouvelé si nécessaire
 */
router.get('/profile', refreshTokenIfNeeded, requireAuth, (req, res) => {
    const userinfo = req.session.userinfo || null;
    const tokenSet = req.session.tokenSet || null;

    let expiresIn = null;
    let isExpired = true;

    if (tokenSet && typeof tokenSet.expires_at === 'number') {
        expiresIn = tokenSet.expires_at - Math.floor(Date.now() / 1000);
        isExpired = expiresIn <= 0;
    }

    res.render('pages/profile', {
        title: 'Mon Profil',
        userinfo,
        tokenSet,
        expiresIn,
        isExpired
    });
});

/**
 * GET /devices
 * Page de gestion des appareils (protégée)
 */
router.get('/devices', refreshTokenIfNeeded, requireAuth, (req, res) => {
    res.render('pages/devices', {
        title: 'Mes Appareils'
    });
});

module.exports = router;
