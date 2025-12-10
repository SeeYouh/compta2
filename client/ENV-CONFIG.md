# Configuration d'environnement

Ce projet utilise des variables d'environnement pour configurer la connexion à la base de données JSON.

## Variables d'environnement

Les variables sont définies dans le fichier `.env` à la racine du projet client :

- `VITE_API_BASE_URL` : URL de base pour l'API (par défaut : `http://localhost:3001`)
- `VITE_DB_PORT` : Port du serveur JSON Server (par défaut : `3001`)

## Configuration rapide

1. **Copiez le fichier d'exemple :**

   ```bash
   cp .env.example .env
   ```

2. **Modifiez les valeurs dans `.env` selon vos besoins :**
   ```env
   # Pour utiliser le port 3000 par exemple
   VITE_API_BASE_URL=http://localhost:3000
   VITE_DB_PORT=3000
   ```

## Scripts disponibles

- `npm run server` : Démarre le serveur JSON avec le port configuré dans `.env`
- `npm run server:3001` : Force le port 3001
- `npm run server:3000` : Force le port 3000
- `npm run server:3002` : Force le port 3002

## Exemples d'usage

### Projet sur le port par défaut (3001)

```bash
npm run server
npm run dev
```

### Projet sur le port 3000

Modifiez votre `.env` :

```env
VITE_API_BASE_URL=http://localhost:3000
VITE_DB_PORT=3000
```

Puis démarrez :

```bash
npm run server
npm run dev
```

### Changement rapide de port

```bash
npm run server:3002  # Serveur sur le port 3002
```

Puis modifiez temporairement le `.env` :

```env
VITE_API_BASE_URL=http://localhost:3002
VITE_DB_PORT=3002
```

## Avantages

- ✅ **Flexibilité** : Changez facilement de port selon vos projets
- ✅ **Pas de conflit** : Chaque projet peut utiliser un port différent
- ✅ **Configuration centralisée** : Toute la config dans le fichier `.env`
- ✅ **Valeurs par défaut** : Fonctionne même sans fichier `.env`
