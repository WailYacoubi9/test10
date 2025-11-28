// config/keycloak.js
require('dotenv').config();
const { Issuer } = require('openid-client');

async function initializeKeycloak() {
    const internalUrl = process.env.KEYCLOAK_INTERNAL_URL || 'http://keycloak:8080';
    const publicUrl   = process.env.KEYCLOAK_URL || internalUrl;

    const realm        = process.env.REALM;
    const clientId     = process.env.CLIENT_ID;
    const clientSecret = process.env.CLIENT_SECRET;
    const redirectUri  = process.env.REDIRECT_URI;

    if (!realm || !clientId || !redirectUri) {
        throw new Error('Missing REALM / CLIENT_ID / REDIRECT_URI in environment variables');
    }

    const discoveryUrl = `${internalUrl}/realms/${realm}`;
    console.log('Keycloak discovery URL (internal):', discoveryUrl);

    // Découverte depuis le conteneur (via "keycloak")
    const issuer = await Issuer.discover(discoveryUrl);

    console.log('Issuer reported by Keycloak:', issuer.metadata.issuer);

    // On force l'issuer pour qu'il corresponde aux tokens de Keycloak
    const publicIssuer = `${publicUrl}/realms/${realm}`;
    issuer.metadata.issuer = publicIssuer;
    issuer.issuer = publicIssuer;

    // On réécrit les endpoints utilisés pour les redirections navigateur
    if (issuer.metadata.authorization_endpoint) {
        issuer.metadata.authorization_endpoint =
            issuer.metadata.authorization_endpoint.replace(internalUrl, publicUrl);
    }

    if (issuer.metadata.end_session_endpoint) {
        issuer.metadata.end_session_endpoint =
            issuer.metadata.end_session_endpoint.replace(internalUrl, publicUrl);
    }

    const clientConfig = {
        client_id: clientId,
        redirect_uris: [redirectUri],
        response_types: ['code']
    };

    if (clientSecret) {
        clientConfig.client_secret = clientSecret;
    }

    const keycloakClient = new issuer.Client(clientConfig);

    console.log('Keycloak client initialized with:');
    console.log('  internal URL :', internalUrl);
    console.log('  public  URL  :', publicUrl);
    console.log('  realm        :', realm);
    console.log('  client_id    :', clientId);

    return keycloakClient;
}

module.exports = { initializeKeycloak };
