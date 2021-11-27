var socket = io();

//Gérer l'arrivé du'n nouvel utilisateur dans une room 
socket.on("connect", () => { //utiliser l'evenement 'connect' de socket
    //emettre un message d'entré dans une salle (le client à la première connexion atterie )
    socket.emit("enter_room", "general");
})

window.onload = () => {
    var messages = document.querySelector('#messages');
    var form = document.querySelector('#form');
    var username = document.querySelector('#username');
    var message = document.querySelector('#message');

    //Emission du message du client vers le serveur
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        if (!username.value) {
            window.alert("Please, make sure to write ure username down bellow so we can identify you.");
        } else {
            //récuperer le nom de la salle ou on se trouve afin de n'afficher que les messages qui concenrent la salle
            const room = document.querySelector("#tabs li.active").dataset.room;
            const createdAt = new Date();
            if (message.value) {
                socket.emit('chat message', {
                    name: username.value,
                    message: message.value,
                    room: room,
                    createdAt: createdAt
                });
                message.value = '';
            } else {
                window.alert("Your message is empty :)");
            }
        }

    });
    socket.on('received message', function(msg) { // reception du message renvoyé par le serveur et affichage de celui_ci
        publishMessages(msg);
    });

    //Ecouter les clics sur les onglets
    document.querySelectorAll("#tabs li").forEach((tab) => {
        tab.addEventListener("click", function() {
            //vérifier si l'onglet n'est pas actif
            if (!this.classList.contains("active")) {
                //on recupere l'element actuellement active 
                const actif = document.querySelector("#tabs li.active");
                actif.classList.remove("active");
                this.classList.add("active");
                document.querySelector("#messages").innerHTML = "";
                //Quitter l'ancienne salle et entrer dans la nouvelle
                socket.emit("leave_room", actif.dataset.room);
                socket.emit("enter_room", this.dataset.room);

            }
        })
    });

    //Ecouter l'evenement init.message
    socket.on("init_messages", msg => {
        let data = JSON.parse(msg.messages);
        if (data != []) {
            data.forEach(donnees => {
                publishMessages(donnees);
            })
        }
    });

    // On écoute la frappe au clavier
    document.querySelector("#message").addEventListener("input", () => {
        // On récupère le nom
        const name = document.querySelector("#username").value;
        // On récupère le salon
        const room = document.querySelector("#tabs li.active").dataset.room;

        socket.emit("typing", {
            name: name,
            room: room
        });
    });

    // On écoute les messages indiquant que quelqu'un tape au clavier
    socket.on("usertyping", msg => {
        const writing = document.querySelector("#writing");

        writing.innerHTML = `${msg.name} tape un message...`;

        setTimeout(function() { //effacer le message "writing" au bout de 5secondes
            writing.innerHTML = "";
        }, 5000);
    });

    socket.on("typing", msg => {
        socket.to(msg.room).emit("usertyping", msg);
    })
}


function publishMessages(msg) {
    let created = new Date(msg.createdAt);
    var item = document.createElement('li');
    item.innerHTML += `<small>${created.toLocaleDateString()}&nbsp${created.toLocaleTimeString()}</small><br/>
    ${msg.name} wrote ${msg.message}`;
    messages.appendChild(item);
    window.scrollTo(0, document.body.scrollHeight);
}