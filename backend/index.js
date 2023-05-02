"use strict";
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(bodyParser.json());
app.use(cors());

const DATA_FILE = path.join(__dirname, 'data.json');

function createHATEOASLinks(item, index) {
  return {
    item,
    links: {
      self: `/liste_epicerie/${index}`,
      delete: `/liste_epicerie/${index}`,
    },
  };
}

app.post('/liste_epicerie', (req, res) => {
  const item = req.body.item;

  fs.readFile(DATA_FILE, (err, data) => {
    if (err) {
      res.status(500).send('Erreur lors de la lecture du fichier de données');
    } else {
      const liste = JSON.parse(data);
      liste.push(item);
      fs.writeFile(DATA_FILE, JSON.stringify(liste), (err) => {
        if (err) {
          res.status(500).send('Erreur lors de l\'écriture du fichier de données');
        } else {
          res.status(201).json(createHATEOASLinks(item, liste.length - 1));
        }
      });
    }
  });
});

app.delete('/liste_epicerie/:id', (req, res) => {
  const index = parseInt(req.params.id, 10);

  fs.readFile(DATA_FILE, (err, data) => {
    if (err) {
      res.status(500).send('Erreur lors de la lecture du fichier de données');
    } else {
      const liste = JSON.parse(data);
      if (index >= 0 && index < liste.length) {
        const item = liste[index];
        liste.splice(index, 1);
        fs.writeFile(DATA_FILE, JSON.stringify(liste), (err) => {
          if (err) {
            res.status(500).send('Erreur lors de l\'écriture du fichier de données');
          } else {
            res.status(200).json({
              message: 'Item supprimé',
              deletedItem: createHATEOASLinks(item, index),
            });
          }
        });
      } else {
        res.status(404).send('Item non trouvé');
      }
    }
  });
});

app.get('/liste_epicerie', (req, res) => {
  fs.readFile(DATA_FILE, (err, data) => {
    if (err) {
      res.status(500).send('Erreur lors de la lecture du fichier de données');
    } else {
      const liste = JSON.parse(data);
      const listeHATEOAS = liste.map((item, index) => createHATEOASLinks(item, index));
      res.status(200).json(listeHATEOAS);
    }
  });
});

if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify([]));
}

app.listen(PORT, () => {
  console.log(`Serveur en écoute sur le port ${PORT}`);
});


