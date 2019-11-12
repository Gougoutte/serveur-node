var co = require('../../database/bddconnect');
var express = require('express');
var app = express();
var bodyParser = require("body-parser");
var jwt = require('../../jwt/token.js');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var liker = function (req, res) {
    var nom = req.body.nom;
    var prenom = req.body.prenom;
    var event = req.body.event;
    if (nom && prenom && event) {
        co.connection.beginTransaction(function (error) {
            co.connection.query("SELECT Id_utilisateur FROM utilisateur WHERE Nom = '" + nom + "' AND prenom = '" + prenom + "'", function (error, rows) {
                if (!!error) {
                    console.log('Erreur dans la requête 1 ');
                    res.json({ message: "erreur de la requête" });
                    co.connection.rollback(function () {
                    });
                } else if (rows[0] == null) {
                    console.log('Requête réussie');
                    res.json({ message: "l'utilisateur n'existe pas" });
                    co.connection.rollback(function () {
                    });
                } else {
                    perso = rows[0].Id_utilisateur;
                    co.connection.query("SELECT Id_evenements FROM evenement WHERE Nom = '" + event + "'", function (error, rows) {
                        if (!!error) {
                            console.log('Erreur dans la requête 2 ');
                            res.json({ message: "erreur de la requête" });
                            co.connection.rollback(function () {
                            });
                        } else if (rows[0] == null) {
                            console.log('Requête réussie');
                            res.json({ message: "l'évenement n'existe pas" });
                            co.connection.rollback(function () {
                            });
                        } else {
                            eve = rows[0].Id_evenements;
                            co.connection.query("SELECT Aime,Commentaire FROM avis WHERE Id_utilisateur = " + perso + " AND Id_evenements = " + eve + "", function (error, rows) {
                                if (!!error) {
                                    console.log('Erreur dans la requête 3');
                                    res.json({ message: "erreur de la requête" });
                                    co.connection.rollback(function () {
                                    });
                                } else if (rows[0] == null) {
                                    co.connection.query("INSERT INTO avis (Id_utilisateur,Id_evenements,Aime) VALUES (" + perso + "," + eve + ",1) ", function (error, rows) {
                                        if (!!error) {
                                            console.log('Erreur dans la requête 4 ');
                                            res.json({ message: "erreur de la requête" });
                                            co.connection.rollback(function () {
                                            });
                                        } else {
                                            co.connection.commit(function (error) {
                                                if (!!error) {
                                                    console.log('Erreur dans la requête 4.5 ');
                                                    res.json({ message: "erreur de la requête" });
                                                    co.connection.rollback(function () {
                                                    });
                                                } else {
                                                    console.log('Requête réussie !\n');
                                                    res.json({ message: "Super like" });
                                                }
                                            });
                                        }
                                    });

                                } else {
                                    if (rows[0].Aime == 0) {
                                        co.connection.query("UPDATE avis SET Aime = 1 WHERE Id_evenements = " + eve + " AND Id_utilisateur = " + perso + "",
                                            function (error, rows) {
                                                if (!!error) {
                                                    console.log('Erreur dans la requête 5 ');
                                                    res.json({ message: "erreur de la requête" });
                                                    co.connection.rollback(function () {
                                                    });
                                                } else {
                                                    co.connection.commit(function (error) {
                                                        if (!!error) {
                                                            console.log('Erreur dans la requête 5.5 ');
                                                            res.json({ message: "erreur de la requête" });
                                                            co.connection.rollback(function () {
                                                            });
                                                        } else {
                                                            console.log('Requête réussie !\n');
                                                            res.json({ message: "Super like" });
                                                        }
                                                    });
                                                }
                                            });
                                    } else if (rows[0].Commentaire == null) {
                                        co.connection.query("DELETE FROM avis WHERE Id_evenements = " + eve + " AND Id_utilisateur = " + perso + "",
                                            function (error, rows) {
                                                if (!!error) {
                                                    console.log('Erreur dans la requête 5 ');
                                                    res.json({ message: "erreur de la requête" });
                                                    co.connection.rollback(function () {
                                                    });
                                                } else {
                                                    co.connection.commit(function (error) {
                                                        if (!!error) {
                                                            console.log('Erreur dans la requête 5.5 ');
                                                            res.json({ message: "erreur de la requête" });
                                                            co.connection.rollback(function () {
                                                            });
                                                        } else {
                                                            console.log('Requête réussie !\n');
                                                            res.json({ message: "Super unlike" });
                                                        }
                                                    });
                                                }
                                            });
                                    } else {
                                        co.connection.query("UPDATE avis SET Aime = 0 WHERE Id_evenements = " + eve + " AND Id_utilisateur = " + perso + "",
                                            function (error, rows) {
                                                if (!!error) {
                                                    console.log('Erreur dans la requête 6 ');
                                                    res.json({ message: "erreur de la requête" });
                                                    co.connection.rollback(function () {
                                                    });
                                                } else {
                                                    co.connection.commit(function (error) {
                                                        if (!!error) {
                                                            console.log('Erreur dans la requête 6.5 ');
                                                            res.json({ message: "erreur de la requête" });
                                                            co.connection.rollback(function () {
                                                            });
                                                        } else {
                                                            console.log('Requête réussie !\n');
                                                            res.json({ message: "Super unlike" });
                                                        }
                                                    });
                                                }
                                            });
                                    }
                                }
                            });
                        }
                    });
                }
            });
        });
    } else {
        console.log('Erreur dans la requête');
        res.json({ message: "Veuillez remplir tous les champs !" });
    }
}

var comment = function (req, res) {
    var commentaire = req.body.commentaire;
    var mail = req.body.mail;
    var event = req.body.event;
    var today = new Date();
    var date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();

    if (mail && commentaire && event) {
        co.connection.query("SELECT Mail, Id_utilisateur FROM utilisateur WHERE Mail = ?", [mail], function (error, rows) {
            if (!!error) {
                console.log('Erreur dans la requête');
                res.json({ message: "Erreur dans la requête !" });
            } else if (rows.length == 0) {
                res.json({ message: "Cet utilisateur n'existe pas !" })
            } else {
                var id_ut = rows[0].Id_utilisateur
                co.connection.query("SELECT Nom, Id_evenements FROM evenement WHERE Nom = ? AND Date_fin <= ?", [event, date], function (error, rows) {
                    if (!!error) {
                        console.log('Erreur dans la requête');
                        res.json({ message: "Erreur dans la requête !" });
                    } else if (rows.length == 0) {
                        res.json({ message: "Cet évènement n'existe pas ou n'est pas encore passé !" })
                    } else {
                        var id_ev = rows[0].Id_evenements
                        co.connection.query("INSERT INTO avis (Commentaire, Id_utilisateur, Id_evenements) VALUE (?, ?, ?)", [commentaire, id_ut, id_ev], function (error, rows) {
                            if (!!error) {
                                console.log('Erreur dans la requête');
                                res.json({ message: "Erreur dans la requête !" });
                            } else {
                                res.json({ message: "Votre commentaire a bien été ajouté !" })
                            }
                        })
                    }
                })
            }
        })
    } else if (mail && event) {
        co.connection.query("SELECT Mail FROM utilisateur WHERE Mail = ?", [mail], function (error, rows) {
            if (!!error) {
                console.log('Erreur dans la requête');
                res.json({ message: "Erreur dans la requête !" });
            } else if (rows.length == 0) {
                res.json({ message: "Cet utilisateur n'existe pas !" })
            } else {
                co.connection.query("SELECT Nom FROM evenement WHERE Nom = ?", [event], function (error, rows) {
                    if (!!error) {
                        console.log('Erreur dans la requête');
                        res.json({ message: "Erreur dans la requête !" });
                    } else if (rows.length == 0) {
                        res.json({ message: "Cet évènement n'existe pas !" })
                    } else {
                        res.json({ message: "Vous n'avez pas entré de commentaire !" });
                    }
                })
            }
        })
    } else if (mail) {
        co.connection.query("SELECT mail FROM utilisateur WHERE mail = ?", [mail], function (error, rows) {
            if (!!error) {
                console.log('Erreur dans la requête');
                res.json({ message: "Erreur dans la requête !" });
            } else if (rows.length == 0) {
                res.json({ message: "Cet utilisateur n'existe pas !" })
            } else {
                res.json({ message: "Vous n'avez pas sélectionné d'évènement !" })
            }
        })
    } else {
        res.json({ message: "Vous n'êtes pas connecté, vous ne pouvez pas laisser de commentaire !" })
    }
}

var suprcomm = function (req, res) {
    var nom = req.body.nom;
    var prenom = req.body.prenom;
    var event = req.body.event;
    var com = req.body.com;
    if (nom && prenom && event && com) {
        co.connection.query("SELECT avis.Id_avis,avis.Aime FROM avis INNER JOIN evenement ON evenement.Id_evenements = avis.Id_evenements INNER JOIN utilisateur ON avis.Id_utilisateur = utilisateur.Id_utilisateur WHERE utilisateur.Nom = '" + nom + "' AND utilisateur.Prenom = '" + prenom + "' AND evenement.nom = '" + event + "' AND avis.Commentaire = '" + com + "'",
            function (error, rows) {
                if (!!error) {
                    console.log('Erreur dans la requête');
                    res.json({ message: "erreur de la requête" });
                } else if (rows[0] == null) {
                    console.log('Requête réussie');
                    res.json({ message: "le commentaire n'existe pas" });
                } else if (rows[0].Aime == 1) {
                    co.connection.query("UPDATE avis SET Commentaire = NULL WHERE Id_avis = " + rows[0].Id_avis + "",
                        function (error, rows) {
                            if (!!error) {
                                console.log('Erreur dans la requête 2 ');
                                res.json({ message: "erreur de la requête" });
                            } else {
                                console.log('Requête réussie !\n');
                                res.json({ message: "Commentaire supprimé" });
                            }
                        });
                } else {
                    co.connection.query("DELETE FROM avis WHERE Id_avis = " + rows[0].Id_avis + "",
                        function (error, rows) {
                            if (!!error) {
                                console.log('Erreur dans la requête 3 ');
                                res.json({ message: "erreur de la requête" });
                            } else {
                                console.log('Requête réussie !\n');
                                res.json({ message: "Commentaire supprimé" });
                            }

                        });

                }
            });
    } else {
        console.log('Erreur dans la requête');
        res.json({ message: "Veuillez remplir tous les champs !" });
    }
}

module.exports = {
    liker,
    comment,
    suprcomm
};