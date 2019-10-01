const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const axios = require('axios');
const mikeUtilities = require('./useful/useful-functions.js');
let scans = 0;
let radarFile = '';

app.use('/', express.static(__dirname))
app.get('/', (req, res) => {
    res.sendFile(__dirname + 'index.html')
})

Math.radians = function(degrees) {
    return degrees * Math.PI / 180;
}

io.on('connection', async client => {
    client.on('load-file', async file => {
        radarFile = file;
        console.log("Loading file!");
        scans = await axios.post(
            'http://localhost:52680/api/v1/nexrad/scans?RadarFile=' + radarFile,
            { "RadarFile": radarFile, "ElevationNumber": 1 },
            { headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' } })
            .then(response => {
                return response.data
            });

            client.emit('set-scans', scans);
    });

    client.on('sweep', async sweep => {
        console.log("Sweeping!");
        var reflectivityList = await axios.post(
            'http://localhost:52680/api/v1/nexrad/high-resolution-reflectivity?RadarFile='+radarFile,
            { "RadarFile": radarFile, "ElevationNumber": 1 },
            { headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' } })
            .then(response => {
                return response.data
            });

        var azimuthList = await axios.post(
            'http://localhost:52680/api/v1/nexrad/azimuth?RadarFile=' + radarFile,
            { "RadarFile": radarFile, "ElevationNumber": 1 },
            { headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' } })
            .then(response => {
                return response.data
            });

        for (let i = 0; i < scans; i++) {
            var reflectivity = reflectivityList[i];
            var azimuth = Math.radians(azimuthList[i]);
            var sinMultiplier = Math.sin(azimuth);
            var cosMultiplier = Math.cos(azimuth);

            var initialRange = mikeUtilities.addRange(mikeUtilities.multiplyRange(mikeUtilities.createRange(0, reflectivity.GateCount, 1), reflectivity.GateSize), reflectivity.FirstGate);
            var x = mikeUtilities.multiplyRange(initialRange, sinMultiplier);
            var y = mikeUtilities.multiplyRange(initialRange, cosMultiplier);

            var dataSet = {
                x: x,
                y: y,
                reflectivity: reflectivity
            };

            client.emit('plot-data', dataSet);
        }
    });
});

http.listen(9595, () => {
    console.log('Listening on 9595');
})