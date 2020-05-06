const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const port = process.env.PORT || 3000;

app.use(express.static(__dirname + '/public'));

var currentConnections = {};
var wordlist=["Angel",
    "Eyeball",
    "Pizza",
    "Angry",
    "Fireworks",
    "Pumpkin",
    "Baby",
    "Flower",
    "Rainbow",
    "Beard",
    "Flying saucer",
    "Recycle",
    "Bible",
    "Giraffe",
    "Sand castle",
    "Bikini",
    "Glasses",
    "Snowflake",
    "Book",
    "High heel",
    "Stairs",
    "Bucket",
    "Ice cream cone",
    "Starfish",
    "Bumble bee",
    "Igloo",
    "Strawberry",
    "Butterfly",
    "Lady bug",
    "Sun",
    "Camera",
    "Lamp",
    "Tire",
    "Cat",
    "Lion",
    "Toast",
    "Church",
    "Mailbox",
    "Toothbrush",
    "Crayon",
    "Night",
    "Toothpaste",
    "Dolphin",
    "Nose",
    "Truck",
    "Egg",
    "Olympics",
    "Volleyball",
    "Eiffel Tower",
    "Peanut",
    "pig",
    "lollipop",
    "football",
    "bone",
    "fire",
    "computer",
    "lizard",
    "crayon",
    "snake",
    "mitten",
    "table",
    "rainbow",
    "Mickey Mouse",
    "curl",
    "heart",
    "star",
    "sheep",
    "slide",
    "worm",
    "dinosaur",
    "ocean",
    "hook",
    "kitten",
    "doll",
    "baby",
    "cheese",
    "ring",
    "mountain",
    "coin",
    "key",
    "dog",
    "circle",
    "blanket",
    "family",
    "bracelet",
    "robot",
    "hair",
    "octopus",
    "cloud",
    "comb",
    "apple",
    "basketball",
    "crack",
    "bug",
    "knee",
    "ants",
    "clock",
    "frog",
    "bee",
    "feather",
    "Abraham Lincoln",
    "Kiss",
    "Pigtails",
    "Brain",
    "Kitten",
    "Playground",
    "Bubble bath",
    "Kiwi",
    "Pumpkin pie",
    "Buckle",
    "Lipstick",
    "Raindrop",
    "Bus",
    "Lobster",
    "Robot",
    "Car accident",
    "Lollipop",
    "Sand castle",
    "Castle",
    "Magnet",
    "Slipper",
    "Chain saw",
    "Megaphone",
    "Snowball",
    "Circus tent",
    "Mermaid",
    "Sprinkler",
    "Computer",
    "Minivan",
    "Statue of Liberty",
    "Crib",
    "Mount Rushmore",
    "Tadpole",
    "Dragon",
    "Music",
    "Teepee",
    "Dumbbell",
    "North pole",
    "Telescope",
    "Eel",
    "Nurse",
    "Train",
    "Ferris wheel",
    "Owl",
    "Tricycle",
    "Flag",
    "Pacifier",
    "Tutu",
    "Junk mail",
    "Piano",
    "pants",
    "bat",
    "football",
    "snowman",
    "triangle",
    "snake",
    "angel",
    "orange",
    "table",
    "box",
    "rabbit",
    "bunk bed",
    "hat",
    "airplane",
    "swimming pool",
    "monster",
    "sheep",
    "nail",
    "desk",
    "train",
    "hook",
    "daisy",
    "lemon",
    "hippo",
    "dog",
    "blocks",
    "mountains",
    "door",
    "love",
    "dragon",
    "octopus",
    "cupcake",
    "button",
    "glasses",
    "basketball",
    "bathroom",
    "leg",
    "bird",
    "backpack",
    "sea turtle",
    "tree",
    "ball",
    "boy",
    "clock",
    "crab",
    "ship",
    "bee",
    "motorcycle",
    "chair",
    "shoe"]
var teamadrawer='';
var teambdrawer='';
var inita=false;
var initb=false;

function get_users_in_rooms() {
    var ausers = {};
    var busers = {};
    // var roster = io.sockets.clients('A');
    // roster.forEach(function(client) {
    //     ausers.push( client.name);
    // });
    // roster = io.sockets.clients('B');
    // roster.forEach(function(client) {
    //     busers.push( client.name);
    // });
    var roomdata = io.sockets.adapter.rooms['A'];
    if (roomdata !== undefined) {
        var clients = roomdata.sockets;
        for (var client in clients) {
            // ausers.push(currentConnections[client].name);
            ausers[currentConnections[client].name]=currentConnections[client].drawer
        }
    }

    roomdata = io.sockets.adapter.rooms['B'];
    if (roomdata !== undefined) {
        var clients = roomdata.sockets;
        for (var client in clients) {
            // busers.push(currentConnections[client].name);
            busers[currentConnections[client].name]=currentConnections[client].drawer
        }

    }
    console.log([ausers, busers])
    return {a: ausers, b: busers}
}

function onConnection(socket) {
    socket.on('drawing', (data) => socket.broadcast.emit('drawing', data));
}
function getRndInteger(min, max) {
    return Math.floor(Math.random() * (max - min) ) + min;
}
function broadcast() {
    io.sockets.in('game').emit('userconnected', get_users_in_rooms());
    // io.to('B').emit('userconnected', get_users_in_rooms());
}


io.on('connection', function (socket) {
    currentConnections[socket.id] = {socket: socket};
    socket.join('lobby');
    socket.emit('waiting', {waiting: true});


    socket.on('inituser', function (data) {

        currentConnections[socket.id].name = data.name;
        currentConnections[socket.id].team = data.team;
        if (data.team === 'A') {
            if(!inita){
                currentConnections[socket.id].drawer=true
                inita=true
            }else{
                currentConnections[socket.id].drawer=false
            }
            socket.leave('lobby')
            socket.join('A');
            socket.join('game');
        } else if (data.team === 'B') {
            if(!initb){
                currentConnections[socket.id].drawer=true
                initb=true
            }else{
                currentConnections[socket.id].drawer=false
            }
            socket.leave('lobby')
            socket.join('B');
            socket.join('game');

        }

        // socket.broadcast.emit('userconnected', get_users_in_rooms());
        // .emit('some event');
        broadcast();

    });

    socket.on('log', function (name) {
        console.log(currentConnections);

    });
    socket.on('clear', function (data) {
        io.sockets.in('game').emit('clear', data);

    });
    socket.on('get_next', function () {
        io.sockets.in('game').emit('got_word', {word: wordlist[getRndInteger(0,wordlist.length)]});

    });
    socket.on('drawing', (data) => socket.broadcast.emit('drawing', data));
    socket.on('canidraw', function () {
        console.log(currentConnections[socket.id].drawer)
        socket.emit('drawres',currentConnections[socket.id].drawer);
        // delete currentConnections[socket.id];
    });
    // socket.on('updatecanidraw', function () {
    //     console.log(currentConnections[socket.id].drawer)
    //     socket.emit('drawres',currentConnections[socket.id].drawer);
    //     // delete currentConnections[socket.id];
    // });
    socket.on('change-drawer-a', function (data) {
        // console.log(data)
        var sids=Object.keys(currentConnections)
        for (var i = 0; i < sids.length; ++i) {
            try {
                if (currentConnections[sids[i]].team === 'A') {
                    if (currentConnections[sids[i]].name === data) {
                        currentConnections[sids[i]].drawer = true
                        // io.to(sids[i]).emit('uopdatecanidraw', true);
                        io.sockets.in('game').emit('updatecanidraw');
                    } else {
                        currentConnections[sids[i]].drawer = false
                    }
                }
            }catch (e) {
                continue
            }
        }
        io.sockets.in('game').emit('userconnected', get_users_in_rooms());
    })
    socket.on('change-drawer-b', function (data) {
        // console.log(data)
        var sids=Object.keys(currentConnections)
        for (var i = 0; i < sids.length; ++i) {
            try {
                if (currentConnections[sids[i]].team === 'B') {
                    if (currentConnections[sids[i]].name === data) {
                        currentConnections[sids[i]].drawer = true
                        // io.to(sids[i]).emit('uopdatecanidraw', true);
                        io.sockets.in('game').emit('updatecanidraw');
                    } else {
                        currentConnections[sids[i]].drawer = false
                    }
                }
            }catch (e) {
                continue
            }
        }
        io.sockets.in('game').emit('userconnected', get_users_in_rooms());
    })
    socket.on('disconnect', function () {
        io.sockets.in('game').emit('userconnected', get_users_in_rooms());
        delete currentConnections[socket.id];
        // console.log(Object.keys(currentConnections))
        // currentConnections[Object.keys(currentConnections)[0]].drawer=true;
    });
});

http.listen(port, () => console.log('listening on port ' + port));
