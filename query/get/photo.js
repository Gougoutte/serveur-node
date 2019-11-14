var co = require('../../database/bddconnect');
var express = require('express');
var app = express();
var bodyParser = require("body-parser");
var jwt = require('../../jwt/token.js');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//Récupérer toutes les photos seulement si on est du personnel du CESI
var recupphoto = function (req, res) {
    tik = jwt.decodeTokenForUser(req, res);
    if (tik) {
        if (tik.payload.Statut == "personnel") {
            co.connection.query("SELECT URL FROM image", function (error, rows) {
                if (!!error) {
                    console.log('Erreur dans la requête');
                    res.json({ message: "Erreur dans la requête !" });
                } else {
                    console.log('Requête réussie !');
                    numRows = rows.length;
                    const photos = rows.map((row) => ({
                        URL: row.URL,
                    }))
                    res.json({ photos,
                        message: "Liste de toutes les photos"
                      });
                }
            });
        } else {
            res.json({ message: "Vous devez être un membre du personnel pour pouvoir télécharger ces images" });
        }
    } else {
        res.json({ message: "Vous devez être identifier pour effectuer cette action" });
    }
}

module.exports = {
    recupphoto
};