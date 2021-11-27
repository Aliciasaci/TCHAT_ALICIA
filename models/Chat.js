/**
 * Le model pour la table chat  
 */
const Sequelize = require("sequelize");

/**
 * Définition des attributs contenu dans la table chat
 */
module.exports = (sequelize, DataTypes) => { //Datatype permet de connaitre le type de donnée qu'on veut stocker
    return sequelize.define("chat", {
        name: Sequelize.STRING,
        message: Sequelize.STRING,
        room: Sequelize.STRING
    });
};