/**
 * Express est le serveur web utilisé
 *
 */
//instancier le serveur express
const express = require('express');
const app = express();

const path = require("path");
app.use(express.static(path.join(__dirname, "ressources")));

const http = require('http');
//création d'une instance de http qui utilise l'instance de express
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

// On charge sequelize
const Sequelize = require("sequelize");

// On fabrique le lien de la base de données
const dbPath = path.resolve(__dirname, "chat.sqlite");

// On se connecte à la base
const sequelize = new Sequelize("database", "username", "password", {
    host: "localhost",
    dialect: "sqlite",
    logging: false,
    storage: dbPath
});

// On charge le modèle "Chat"
const Chat = require("./Models/Chat")(sequelize, Sequelize.DataTypes);
// On effectue le chargement "réèl"
Chat.sync();
// Chat.sync({ force: true }); //pour vider la table


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

    //Ecouter les entrées dans les salles
    socket.on('enter_room', (room) => {
        //on entre dans la salle demandé
        socket.join(room);
        console.log(socket.rooms); //socket.rooms est la liste des salle dans le serveur( rooms est une variable qui appartient à socket dans ce cas)

        //afficher tous les message du salon à un utilisateur lorsqu'il se connecte sur celui-ci
        Chat.findAll({
            attributes: ["id", "name", "message", "room", "createdAt"],
            where: {
                room: room
            }
        }).then(list => {
            socket.emit("init_messages", { messages: JSON.stringify(list) });
        });
    });


    //quitter l'ancienne salle
    socket.on("leave_room", (room) => {
        socket.leave(room);
        console.log(socket.rooms);
    });

    //Ecouter les messages échangés(Réception dans le serveur du message emi par le client)
    socket.on('chat message', (msg) => {
        // Converser le message reçu par le client dans une base de données
        const message = Chat.create({
            name: msg.name,
            message: msg.message,
            room: msg.room,
            createdAt: msg.createdAt
        }).then(() => {
            //le message est stocké, on le relais à tous les utilisateurs dans le salon correspondant
            io.in(msg.room).emit("received message", msg);
        }).catch(e => {
            console.log(e); //catch les erreurs
        });
        console.log(msg);
        // io.emit('received message', msg); //renvoyer le message emi par le client emetteur vers tous les autres clients
    });

    socket.on("typing", msg => {
        socket.to(msg.room).emit("usertyping", msg);
    })
});
//Demander au serveru HTPP de répondre sur le port 3000
server.listen(3000, () => {
    console.log('listening on *:3000');
});