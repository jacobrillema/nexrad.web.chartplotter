const express = require('express')
const app = express()
const http = require('http').Server(app)
const io = require('socket.io')(http)
const tensorflow = require('@tensorflow/tfjs-node');
const https = require('https');
const axios = require('axios');
var mikeUtilities = require('./useful/useful-functions.js');

let radar = null
let fileLoading = false
let scans = 0

Math.radians = function(degrees) {
    return degrees * Math.PI / 180;
}

app.use('/', express.static(__dirname))
app.get('/', (req, res) => {
    res.sendFile(__dirname + 'index.html')
})

io.on('connection', async client => {
    client.on('loadFile', async file => {
        scans = await axios.post('http://localhost:52680/api/v1/nexrad/scans?RadarFile=KTLX20130520_200356_V06', {"RadarFile": "KTLX20130520_200356_V06","ElevationNumber": 1}, { headers: {'Accept': 'application/json', 'Content-Type': 'application/json'}}).then(response => {return response.data});
        client.emit('setScans', scans);
    });

    client.on('sweep', async sweep => {
        // var reflectivity = axios.get('http://localhost:52680/api/v1/nexrad/high-resolution-reflectivity?RadarFile=KTLX20130520_200356_V06').then(response => {return response;});
        var reflectivityList = await axios.post('http://localhost:52680/api/v1/nexrad/high-resolution-reflectivity?RadarFile=KTLX20130520_200356_V06', {"RadarFile": "KTLX20130520_200356_V06","ElevationNumber": 1}, { headers: {'Accept': 'application/json', 'Content-Type': 'application/json'}}).then(response => {return response.data});
       
        // var azimuthData = axios.get('http://localhost:52680/api/v1/nexrad/azimuth?RadarFile=KTLX20130520_200356_V06').then(response => {return response;});
        var azimuthList = await axios.post('http://localhost:52680/api/v1/nexrad/azimuth?RadarFile=KTLX20130520_200356_V06', {"RadarFile": "KTLX20130520_200356_V06","ElevationNumber": 1}, { headers: {'Accept': 'application/json', 'Content-Type': 'application/json'}}).then(response => {return response.data});

        for(let i = 0; i < scans; i++) {

            // let thisReflectivity = reflectivityList[i];
            // let thisAzimuth = tensorflow.scalar(Math.radians(azimuthList[i]));

            // let thisRange = tensorflow.range(0, thisReflectivity.GateCount, 1).mul(tensorflow.scalar(thisReflectivity.GateSize)).add(tensorflow.scalar(thisReflectivity.FirstGate));

            // console.log(thisRange.print());

            let thisReflectivity = reflectivityList[i];
            let thisAzimuth = Math.radians(azimuthList[i]);
            var sinAzimuth = Math.sin(thisAzimuth);
            var cosAzimuth = Math.sin(thisAzimuth);

            let range = mikeUtilities.createRange(0, thisReflectivity.GateCount, 1);
            let multipliedRange = mikeUtilities.multiplyRange(range, thisReflectivity.GateSize);
            let addedRange = mikeUtilities.addRange(range, thisReflectivity.FirstGate);

            let xs = mikeUtilities.multiplyRange(addedRange, sinAzimuth);
            let ys = mikeUtilities.multiplyRange(addedRange, cosAzimuth);

            let fff = 1;
        }

        
        let a = 1;
    })
})

http.listen(8080, () => {
    console.log('Listening on *:8080')
})