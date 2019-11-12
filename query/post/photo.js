var co = require('../../database/bddconnect');
var express = require('express');
var app = express();
var bodyParser = require("body-parser");
var jwt = require('../../jwt/token.js');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//Les personnes inscrites à l'évènement peuvent ajouter des photos
var addphoto = function (req, res) {
    var event = req.body.event;
    var url = req.body.url;
    var today = new Date();
    var date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();

    if (url && event) {
        co.connection.query("SELECT evenement.Id_evenements, evenement.Nom AS évènement, evenement.Date_fin, utilisateur.Prenom, utilisateur.Nom FROM evenement INNER JOIN participer ON participer.Id_evenements = evenement.Id_evenements INNER JOIN utilisateur ON participer.Id_Utilisateur = utilisateur.Id_Utilisateur WHERE evenement.Date_fin <= ? AND evenement.Nom = ?", [date, event], function (error, rows) {
            if (!!error) {
                console.log('Erreur dans la requête');
                res.json({ message: "Erreur dans la requête !" });
            } else if (rows.length == 0) {
                res.json({ message: "L'évènement n'existe pas ou il n'est pas encore passé !" });
            } else {
                var id_evenement = rows[0].Id_evenements;
                co.connection.query("INSERT INTO `image` (URL, Id_evenements) VALUES (?, ?) ", [url, id_evenement], function (error, rows) {
                    if (!!error) {
                        console.log("Erreur dans la requête d'envoi");
                        res.json({ message: "Erreur dans la requête !" });
                    } else {
                        res.json({ message: "L'image a bien été ajoutée !" });
                    }
                })
            }
        })
    } else if (event) {
        res.json({ message: "veuillez sélectionner une image !" });
    } else {
        res.json({ message: "veuillez sélectionner un évènement !" });
    }
}

//Les membres du BDE peuvent supprimer des photos
var suprphoto = function (req, res) {
    var URL = req.query.URL;
    if (URL) {
        co.connection.query("DELETE FROM `image` WHERE URL = '" + URL + "'",
            function (error, rows) {
                if (!!error) {
                    console.log('Erreur dans la requête ');
                    res.json({ message: "erreur de la requête" });
                } else {
                    console.log('Requête réussie !\n');
                    res.json({ message: "photo supprimée" });
                }

            });
    } else {
        console.log('Erreur dans la requête');
        res.json({ message: "Veuillez remplir tous les champs !" });
    }
}

module.exports = {
    suprphoto,
    addphoto
};