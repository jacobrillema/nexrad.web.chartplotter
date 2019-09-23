$(function() {
    var socket = new io();

    $("#load-file").click(function() {
        socket.emit('load-file', 'KTLX20130520_200356_V06');
    });

    $("#start-sweep").click(function() {
        socket.emit('sweep', 1);
    });

    socket.on('plot', function(data) {
        var x = JSON.parse(data.x);
        var y = JSON.parse(data.y);
        var reflectivity = JSON.parse(data.reflectivity);

        
    });
});