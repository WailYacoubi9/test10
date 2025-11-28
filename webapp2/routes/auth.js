const express = require('express');
const { generators } = require('openid-client');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

/**
 * GET /login
 * Initie le flux d'authentification OpenID Connect
 */
router.get('/login', (req, res) => {
    const keycloakClient = req.app.locals.keycloakClient;

    const codeVerifier = generators.codeVerifier();
    const codeChallenge = generators.codeChallenge(codeVerifier);
    const state = generators.state();

    // Sauvegarde des valeurs PKCE pour la vérification
    req.session.codeVerifier = codeVerifier;
    req.session.state = state;

    const authUrl = keycloakClient.authorizationUrl({
        scope: 'openid profile email',
        state: state,
        code_challenge: codeChallenge,
        code_challenge_method: 'S256'
    });

    console.log('Redirection vers Keycloak pour authentification:', authUrl);
    res.redirect(authUrl);
});

/**
 * GET /register
 * Initie le flux d'inscription
 */
router.get('/register', (req, res) => {
    const keycloakClient = req.app.locals.keycloakClient; // pas strictement nécessaire mais cohérent

    const codeVerifier = generators.codeVerifier();
    const codeChallenge = generators.codeChallenge(codeVerifier);
    const state = generators.state();

    req.session.codeVerifier = codeVerifier;
    req.session.state = state;

    const realm = process.env.REALM;
    const publicKeycloakUrl = process.env.KEYCLOAK_URL || 'http://localhost:8080';
    const clientId = process.env.CLIENT_ID || 'webapp';
    const redirectUri = process.env.REDIRECT_URI || 'https://localhost:3000/auth/callback';

    const keycloakBaseUrl = `${publicKeycloakUrl}/realms/${realm}`;

    const registerUrl =
        `${keycloakBaseUrl}/protocol/openid-connect/registrations` +
        `?client_id=${encodeURIComponent(clientId)}` +
        `&response_type=code` +
        `&scope=${encodeURIComponent('openid profile email')}` +
        `&redirect_uri=${encodeURIComponent(redirectUri)}` +
        `&state=${encodeURIComponent(state)}` +
        `&code_challenge=${encodeURIComponent(codeChallenge)}` +
        `&code_challenge_method=S256`;

    console.log("Redirection vers la page d'inscription Keycloak:", registerUrl);
    res.redirect(registerUrl);
});

/**
 * GET /auth/callback
 * Callback OAuth2 - Réception du code d'autorisation
 */
router.get('/auth/callback', async (req, res) => {
    const keycloakClient = req.app.locals.keycloakClient;

    try {
        const redirectUri = process.env.REDIRECT_URI || 'https://localhost:3000/auth/callback';
        const params = keycloakClient.callbackParams(req);

        // Vérification du state (protection CSRF)
        if (!req.session.state || params.state !== req.session.state) {
            throw new Error('State mismatch - possible CSRF attack');
        }

        console.log("Code d'autorisation reçu, échange contre des tokens...");

        // Échange du code contre les tokens
        const tokenSet = await keycloakClient.callback(
            redirectUri,
            params,
            {
                code_verifier: req.session.codeVerifier,
                state: req.session.state
            }
        );

        console.log('Tokens obtenus:', {
            access_token: tokenSet.access_token ? 'present' : 'missing',
            id_token: tokenSet.id_token ? 'present' : 'missing',
            refresh_token: tokenSet.refresh_token ? 'present' : 'missing'
        });

        // Récupération des informations utilisateur
        const userinfo = await keycloakClient.userinfo(tokenSet.access_token);

        // Sauvegarde en session
        req.session.tokenSet = tokenSet;
        req.session.userinfo = userinfo;

        // Nettoyage des variables temporaires
        delete req.session.codeVerifier;
        delete req.session.state;

        console.log('Utilisateur authentifié:', userinfo.preferred_username);
        res.redirect('/profile');
    } catch (error) {
        console.error('Erreur lors du callback:', error);
        res.status(500).render('pages/error', {
            title: 'Erreur d\'authentification',
            message: `Une erreur est survenue lors de l'authentification: ${error.message}`
        });
    }
});

/**
 * GET /logout
 * Déconnexion de l'utilisateur
 */
router.get('/logout', (req, res) => {
    const keycloakClient = req.app.locals.keycloakClient;
    const tokenSet = req.session.tokenSet;
    const port = process.env.PORT || 3000;

    req.session.destroy((err) => {
        if (err) {
            console.error('Erreur lors de la destruction de session:', err);
        }

        const logoutUrl = keycloakClient.endSessionUrl({
            id_token_hint: tokenSet?.id_token,
            post_logout_redirect_uri: `https://localhost:${port}/`
        });

        console.log('Déconnexion et redirection vers Keycloak:', logoutUrl);
        res.redirect(logoutUrl);
    });
});

/**
 * POST /auth/revoke
 * Révocation manuelle des tokens (API endpoint)
 */
router.post('/auth/revoke', requireAuth, async (req, res) => {
    const keycloakClient = req.app.locals.keycloakClient;
    const tokenSet = req.session.tokenSet;

    try {
        console.log('Révocation du token d’accès...');

        if (tokenSet && tokenSet.access_token) {
            await keycloakClient.revoke(tokenSet.access_token, 'access_token');
            console.log('Access token révoqué');
        }

        req.session.destroy();

        res.json({
            success: true,
            message: 'Access token révoqué avec succès'
        });
    } catch (error) {
        console.error('Erreur lors de la révocation des tokens:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /auth/revoke-and-logout
 * Révocation + déconnexion complète
 */
router.get('/auth/revoke-and-logout', requireAuth, async (req, res) => {
    const keycloakClient = req.app.locals.keycloakClient;
    const tokenSet = req.session.tokenSet;
    const port = process.env.PORT || 3000;

    try {
        console.log('Révocation des tokens avant déconnexion...');

        if (tokenSet?.access_token) {
            await keycloakClient.revoke(tokenSet.access_token, 'access_token');
        }
        if (tokenSet?.refresh_token) {
            await keycloakClient.revoke(tokenSet.refresh_token, 'refresh_token');
        }

        console.log('Tokens révoqués, destruction de la session locale...');

        req.session.destroy((err) => {
            if (err) {
                console.error('Erreur lors de la destruction de session:', err);
            }

            const logoutUrl = keycloakClient.endSessionUrl({
                id_token_hint: tokenSet?.id_token,
                post_logout_redirect_uri: `https://localhost:${port}/`
            });

            console.log('Déconnexion complète, redirection:', logoutUrl);
            res.redirect(logoutUrl);
        });
    } catch (error) {
        console.error('Erreur lors de la révocation:', error);
        req.session.destroy();
        res.redirect('/');
    }
});

module.exports = router;
