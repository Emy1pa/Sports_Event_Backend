# Utilisez une image Node.js comme base
FROM node:18-alpine

# Définissez le répertoire de travail
WORKDIR /app

# Copiez les fichiers nécessaires
COPY package.json package-lock.json ./

# Installez les dépendances
RUN npm install

# Copiez le reste des fichiers
COPY . .

# Exposez le port de l'application (par exemple : 5000)
EXPOSE 5000

# Définissez la commande par défaut pour démarrer l'application
CMD ["npm", "start"]
