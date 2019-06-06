const express = require('express')
const app = express()
const http = require('http').Server(app)
const io = require('socket.io')(http)
const tensorflow = require('@tensorflow/tfjs');
const https = require('https');
const axios = require('axios');

let radar = null
let fileLoading = false

Math.radians = function(degrees) {
    return degrees * Math.PI / 180;
}

app.use('/', express.static(__dirname))
app.get('/', (req, res) => {
    res.sendFile(__dirname + 'index.html')
})

io.on('connection', async client => {
    client.on('loadFile', async file => {
        const data = await axios.post('http://localhost:52680/api/v1/nexrad/scans?RadarFile=KTLX20130520_200356_V06', {"RadarFile": "KTLX20130520_200356_V06","ElevationNumber": 1}, { headers: {'Accept': 'application/json', 'Content-Type': 'application/json'}}).then(response => {return response.data});
        client.emit('setScans', data);
    });

    client.on('sweep', async sweep => {
        // var reflectivity = axios.get('http://localhost:52680/api/v1/nexrad/high-resolution-reflectivity?RadarFile=KTLX20130520_200356_V06').then(response => {return response;});
        var reflectivity = await axios.post('http://localhost:52680/api/v1/nexrad/high-resolution-reflectivity?RadarFile=KTLX20130520_200356_V06', {"RadarFile": "KTLX20130520_200356_V06","ElevationNumber": 1}, { headers: {'Accept': 'application/json', 'Content-Type': 'application/json'}}).then(response => {return response.data});
       
        // var azimuthData = axios.get('http://localhost:52680/api/v1/nexrad/azimuth?RadarFile=KTLX20130520_200356_V06').then(response => {return response;});
        var azimuthData = await axios.post('http://localhost:52680/api/v1/nexrad/azimuth?RadarFile=KTLX20130520_200356_V06', {"RadarFile": "KTLX20130520_200356_V06","ElevationNumber": 1}, { headers: {'Accept': 'application/json', 'Content-Type': 'application/json'}}).then(response => {return response.data});

        let azimuth = tensorflow.scalar(Math.radians(azimuthData));
        
        let a = 1;
    })
})

http.listen(8080, () => {
    console.log('Listening on *:8080')
})