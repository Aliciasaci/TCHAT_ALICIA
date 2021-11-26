/**
 * Express est le serveur web utilisé
 *
 */
const express = require('express');
//instancier le serveur express
const app = express();
const http = require('http');
//création d'une instance de http qui utilise l'instance de express
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
//Créer la route / 
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

//Ecouter l'evenement "connetion" de socket.io
io.on('connection', (socket) => {
    console.log("Un utilisateur s'est connecté")

    //Ecouter les déconnexion
    socket.on("disconnect", () => {
        console.log("Un utilisateur s'est déconnecté");
    });

    //Ecouter les messages échangés(Réception dans le serveur du message emi par le client)
    socket.on('chat message', (msg) => {
        io.emit('received message', msg); //renvoyer le message emi par le client emetteur vers tous les autres clients
    });
});
//Demander au serveru HTPP de répondre sur le port 3000
server.listen(3000, () => {
    console.log('listening on *:3000');
});