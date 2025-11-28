/**
 * Middleware pour vérifier si l'utilisateur est authentifié
 */
function requireAuth(req, res, next) {
    if (!req.session || !req.session.tokenSet) {
        return res.redirect('/login');
    }
    next();
}

/**
 * Middleware pour vérifier si le token est expiré
 */
function checkTokenExpiration(req, res, next) {
    if (req.session && req.session.tokenSet) {
        const { expires_at: expiresAt } = req.session.tokenSet;
        const now = Math.floor(Date.now() / 1000);

        if (typeof expiresAt === 'number' && now >= expiresAt) {
            console.log("Token expiré, déconnexion de l'utilisateur");
            req.session.destroy(() => {
                return res.redirect('/login');
            });
            return;
        }
    }
    next();
}

/**
 * Middleware pour rediriger les utilisateurs déjà authentifiés
 */
function redirectIfAuthenticated(req, res, next) {
    if (req.session && req.session.tokenSet) {
        return res.redirect('/profile');
    }
    next();
}

/**
 * Middleware pour gérer automatiquement le refresh token si nécessaire
 */
async function refreshTokenIfNeeded(req, res, next) {
    // Si pas de session ou pas de token, on laisse passer
    if (!req.session || !req.session.tokenSet) {
        return next();
    }

    try {
        const tokenSet = req.session.tokenSet;
        const expiresAt = tokenSet.expires_at;
        const now = Math.floor(Date.now() / 1000);

        if (typeof expiresAt !== 'number') {
            // Si on n'a pas d'info d'expiration, on ne tente pas de refresh
            return next();
        }

        const timeLeft = expiresAt - now;

        // Si le token expire dans moins de 5 minutes, on tente un rafraîchissement
        if (timeLeft < 300) {
            console.log(`Token expire dans ${timeLeft} secondes, tentative de rafraîchissement.`);

            if (!tokenSet.refresh_token) {
                console.log('Aucun refresh_token disponible, déconnexion.');
                req.session.destroy(() => res.redirect('/login'));
                return;
            }

            const keycloakClient = req.app.locals.keycloakClient;

            if (!keycloakClient) {
                console.error('Keycloak client non disponible dans app.locals.');
                req.session.destroy(() => res.redirect('/login'));
                return;
            }

            // Rafraîchir le token
            const newTokenSet = await keycloakClient.refresh(tokenSet.refresh_token);

            // Mise à jour de la session avec les nouveaux tokens
            req.session.tokenSet = newTokenSet;

            // Mettre à jour aussi les informations utilisateur
            const userinfo = await keycloakClient.userinfo(newTokenSet.access_token);
            req.session.userinfo = userinfo;

            console.log('Token rafraîchi automatiquement.');
            console.log(`Nouveau token valide pour encore ${newTokenSet.expires_in} secondes.`);
        }

        next();
    } catch (error) {
        console.error('Erreur lors du rafraîchissement du token:', error.message);
        // Si le refresh échoue (refresh_token expiré ou invalide), on déconnecte
        req.session.destroy(() => res.redirect('/login'));
    }
}

module.exports = {
    requireAuth,
    refreshTokenIfNeeded,
    checkTokenExpiration,
    redirectIfAuthenticated
};
