# Image Node officielle légère
FROM node:18-alpine

# Répertoire de travail dans le conteneur
WORKDIR /app

# Copier uniquement les fichiers de dépendances d'abord (pour profiter du cache Docker)
COPY package*.json ./

# Installer les dépendances
RUN npm install

# Copier le reste du code de l'application
COPY . .

# Exposer le port utilisé par l'application
EXPOSE 3000

# Commande de démarrage
CMD ["npm", "start"]
