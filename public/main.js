var socket = io();
var cteam;
var canidraw;
var currentword;
socket.on('userconnected', function (data) {
    $('#team_a').html('')
    $('#team_a').append("<ul id='newLista'></ul>");
    $("#newLista").append("<li>-------TEAM A-----</li>");
    // for (var i = 0; i < data.a.length; i++) {
    //     // $("#newLista").append("<li>" + data.a[i] + "</li>");
    //     $("#newLista").append("<p><label><input class=\"with-gap\" name=\"team\" type=\"radio\" value=\"" + data.b[i] + "\" /><span>" + data.a[i] + "</span>\n" +
    //         "        </label>\n" +
    //         "      </p>");
    //
    // }
    for (const [key, value] of Object.entries(data.a)) {
            if (value) {
                $("#newLista").append("<p><label><input class=\"with-gap\" name=\"drawer-a\" type=\"radio\" value=\"" + key + "\" checked  /><span>" + key + "</span>\n" +
                    "        </label>\n" +
                    "      </p>");
            } else {
                $("#newLista").append("<p><label><input class=\"with-gap\" name=\"drawer-a\" type=\"radio\" value=\"" + key + "\"   /><span>" + key + "</span>\n" +
                    "        </label>\n" +
                    "      </p>");
            }

    }
    $('#team_b').html('')
    $('#team_b').append("<ul id='newListb'></ul>");
    $("#newListb").append("<li>-------TEAM B-----</li>");
    // for (var i = 0; i < data.b.length; i++) {
    //     // $("#newListb").append("<li>" + data.b[i] + "</li>");
    //     $("#newListb").append("    <p><label><input class=\"with-gap\" name=\"team\" type=\"radio\" value=\"" + data.b[i] + "\" checked /><span>" + data.b[i] + "</span>\n" +
    //         "        </label>\n" +
    //         "      </p>");
    //
    // }
    for (const [key, value] of Object.entries(data.b)) {
        if(value) {
            $("#newListb").append("<p><label><input class=\"with-gap\" name=\"drawer-b\" type=\"radio\" value=\"" + key + "\" checked/><span>" + key + "</span>\n" +
                "        </label>\n" +
                "      </p>");
        }else{
            $("#newListb").append("<p><label><input class=\"with-gap\" name=\"drawer-b\" type=\"radio\" value=\"" + key + "\" /><span>" + key + "</span>\n" +
                "        </label>\n" +
                "      </p>");
        }
    }
    if(cteam==='a'){
        $("#newListb input:radio").attr('disabled',true);
    }else     if(cteam==='b'){
        $("#newLista input:radio").attr('disabled',true);
    }
    $('input[type=radio][name=drawer-'+cteam+']').change(function() {
        socket.emit('change-drawer-'+cteam,this.value)
    });
    // $("#newList"+cteam+" input:radio").attr('disabled',true);
    // console.log(data)
});
$('#usernameform').submit(function (e) {
    e.preventDefault();
    var result = {};
    var valid = true;
    $.each($('form').serializeArray(), function () {
        result[this.name] = this.value;

    });
    if (result.name.length >= 1 && result.team.length >= 1) {
        localStorage.team = result.team
        cteam = result.team.toLowerCase()

        socket.emit('inituser', result);
        socket.emit('canidraw');

        init()
        // socket.emit('get_next');
        $('#name').val('');
        $('#usernameform').css('display', 'none');
        $('#playroom').css('display', 'block');
    }



    return false;
});

socket.on('drawres', function (data) {
    console.log(data)
    canidraw=data
    if (canidraw) {
        $('#clear').show()
        $('#get_word').show()
    }
    else {
        $('#clear').hide()
        $('#get_word').hide()
    }
})
socket.on('updatecanidraw', function (data) {
    socket.emit('canidraw');
})
// socket.on('uopdatecanidraw', function (data) {
//     console.log(data)
//     canidraw=data
//     if (canidraw) {
//         $('#clear').show()
//         $('#get_word').show()
//     }
//     else {
//         $('#clear').hide()
//         $('#get_word').hide()
//     }
// })
socket.on('clear', function (data) {
    var canvas = document.getElementsByClassName('whiteboard_team_' + data)[0];
    var ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = "40px Arial";
    if (canidraw)
        ctx.fillText(currentword,40,50)

})
$('#set_name').on('click', function () {
    socket.emit('log', $('#name').val());
});

$('#clear').on('click', function () {
    socket.emit('clear', cteam);

});

$('#join_game').on('click', function () {
    socket.emit('start');
});
$('#get_word').on('click', function () {
    socket.emit('get_next');
});
socket.on('got_word', function (data) {
    console.log(data)
    var canvas = document.getElementsByClassName('whiteboard_team_a')[0];
    var ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    var canvas = document.getElementsByClassName('whiteboard_team_b')[0];
    var ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    var canvas = document.getElementsByClassName('whiteboard_team_' + cteam)[0];
    var ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = "40px Arial";
    currentword=data.word
    if (canidraw)

        ctx.fillText(currentword,40,50)

})
function init() {
    var canvas = document.getElementsByClassName('whiteboard_team_' + cteam.toLowerCase())[0];
    var colors = document.getElementsByClassName('color');
    var context = canvas.getContext('2d');

    var current = {
        color: 'black'
    };
    var drawing = false;

    canvas.addEventListener('mousedown', onMouseDown, false);
    canvas.addEventListener('mouseup', onMouseUp, false);
    canvas.addEventListener('mouseout', onMouseUp, false);
    canvas.addEventListener('mousemove', throttle(onMouseMove, 10), false);

//Touch support for mobile devices
    canvas.addEventListener('touchstart', onMouseDown, false);
    canvas.addEventListener('touchend', onMouseUp, false);
    canvas.addEventListener('touchcancel', onMouseUp, false);
    canvas.addEventListener('touchmove', throttle(onMouseMove, 10), false);

    for (var i = 0; i < colors.length; i++) {
        colors[i].addEventListener('click', onColorUpdate, false);
    }

    socket.on('drawing', onDrawingEvent);

    window.addEventListener('resize', onResize, false);
    onResize();


    function drawLine(x0, y0, x1, y1, color, emit, team = cteam.toLowerCase()) {
        var canvas = document.getElementsByClassName('whiteboard_team_' + team)[0];
        // var colors = document.getElementsByClassName('color');
        var context = canvas.getContext('2d');
        if (team === 'b') {
            context.beginPath();
            context.moveTo(x0, y0);
            context.lineTo(x1, y1);
            context.strokeStyle = color;
            context.lineWidth = 2;
            context.stroke();
            context.closePath();
        } else {
            context.beginPath();
            context.moveTo(x0, y0);
            context.lineTo(x1, y1);
            context.strokeStyle = color;
            context.lineWidth = 2;
            context.stroke();
            context.closePath();
        }


        if (!emit) {
            return;
        }
        var w = canvas.width;
        var h = canvas.height;

        socket.emit('drawing', {
            x0: x0 / w,
            y0: y0 / h,
            x1: x1 / w,
            y1: y1 / h,
            team: cteam.toLowerCase(),
            color: color
        });
    }

    function onMouseDown(e) {

        // var canvas = document.getElementsByClassName('whiteboard_team_' + cteam.toLowerCase())[0];
        $('html').css('overflow','hidden');
        $('body').css('overflow','hidden');
        var rect = e.target.getBoundingClientRect();
        var x = e.clientX - rect.left;
        var y = e.clientY - rect.top;
        drawing = true;
        current.x = x || e.touches[0].clientX- rect.left;
        current.y = y || e.touches[0].clientY- rect.top;
    }

    function onMouseUp(e) {

        $('html').css('overflow','visible')
        $('body').css('overflow','visible')
        var rect = e.target.getBoundingClientRect();
        var x = e.clientX - rect.left;
        var y = e.clientY - rect.top;
        if (!drawing) {
            return;
        }
        drawing = false;
        if (canidraw)
            drawLine(current.x, current.y, x || e.clientX, y || e.clientY, current.color, true);
    }

    function onMouseMove(e) {
        $('html').css('overflow','hidden')
        $('body').css('overflow','hidden')
        var rect = e.target.getBoundingClientRect();
        var x = e.clientX - rect.left;
        var y = e.clientY - rect.top;
        if (!drawing) {
            return;
        }
        if (canidraw)
            drawLine(current.x, current.y, x || e.touches[0].clientX- rect.left, e.clientY || e.touches[0].clientY- rect.top, current.color, true);
        current.x = x || e.touches[0].clientX- rect.left;
        current.y = e.clientY || e.touches[0].clientY- rect.top;
    }

    function onColorUpdate(e) {
        current.color = e.target.className.split(' ')[1];
    }

// limit the number of events per second
    function throttle(callback, delay) {
        var previousCall = new Date().getTime();
        return function () {
            var time = new Date().getTime();

            if ((time - previousCall) >= delay) {
                previousCall = time;
                callback.apply(null, arguments);
            }
        };
    }

    function onDrawingEvent(data) {
        var w = canvas.width;
        var h = canvas.height;
        if (canidraw ||data.team===cteam)
            drawLine(data.x0 * w, data.y0 * h, data.x1 * w, data.y1 * h, data.color, false, data.team);
    }

// make the canvas fill its parent
    function onResize() {
        var canvas = document.getElementsByClassName('whiteboard_team_a')[0];
        // var colors = document.getElementsByClassName('color');
        // var context = canvas.getContext('2d');
        canvas.width = window.innerWidth *0.5 ;
        canvas.height = window.innerHeight *0.70 ;
        var canvas = document.getElementsByClassName('whiteboard_team_b')[0];
        // var colors = document.getElementsByClassName('color');
        // var context = canvas.getContext('2d');
        canvas.width = window.innerWidth *0.5 ;
        canvas.height = window.innerHeight * 0.70;
    }
}
