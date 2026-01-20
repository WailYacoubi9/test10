require('dotenv').config();
const { Issuer } = require('openid-client');

async function initializeKeycloak() {
    try {
        // UTILISER KEYCLOAK_INTERNAL_URL pour la découverte depuis Docker
        const keycloakInternalUrl = process.env.KEYCLOAK_INTERNAL_URL || process.env.KEYCLOAK_URL || 'http://localhost:8080';
        const realm = process.env.REALM;
        const clientId = process.env.CLIENT_ID;
        const clientSecret = process.env.CLIENT_SECRET;
        const redirectUri = process.env.REDIRECT_URI;

        if (!realm || !clientId || !redirectUri) {
            throw new Error("Configuration Keycloak manquante dans .env");
        }

        const issuerUrl = `${keycloakInternalUrl}/realms/${realm}`;
        console.log('Découverte de l\'issuer:', issuerUrl);

        // Discover depuis l'URL interne (keycloak:8080)
        const issuer = await Issuer.discover(issuerUrl);
        console.log('Issuer découvert:', issuer.metadata.issuer);

        const keycloakClient = new issuer.Client({
            client_id: clientId,
            client_secret: clientSecret,
            redirect_uris: [redirectUri],
            response_types: ['code']
        });

        console.log('Client OpenID Connect initialisé');
        console.log('Configuration:');
        console.log('   - URL interne:', keycloakInternalUrl);
        console.log('   - Client ID:', clientId);
        console.log('   - Redirect URI:', redirectUri);
        console.log('');

        return keycloakClient;
    } catch (error) {
        console.error("Erreur lors de l'initialisation de Keycloak:", error);
        throw error;
    }
}

module.exports = {
    initializeKeycloak
};