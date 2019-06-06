const axios = require('axios');
const tensorflow = require('@tensorflow/tfjs');

var cameraPost = 200;
var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
var renderer = new THREE.WebGLRenderer();
var material = new THREE.PointsMaterial({
    size: 1,
    vertexColors: THREE.VertexColors
})
var sweeper = null
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

$(function() {
    var scan = 1;
    var totalScans = 0;

    $("#load").on("click", function() {
      sweeper = null;
      var scans = axios.get('http://localhost:52680/api/v1/nexrad/scans?RadarFile=KTLX20130520_200356_V06').then(response => {return response});
      totalScans = scans;
    })

    $('#sweep').on('click', function() {
        scene.remove.apply(scene, scene.children);
        scan = 1;
        sweeper = setInterval(sweep, 100)
    })

    function sweep() {
        if(scan < totalScans || totalScans == 0) {
            $('#load').attr('disabled', true);
            GetSweepData();
        }
    }

    function GetSweepData() {
        let reflectivity = axios.get('http://localhost:52680/api/v1/nexrad/high-resolution-reflectivity?RadarFile=KTLX20130520_200356_V06').then(response => {return response});
        let azimuth = axios.get('http://localhost:52680/api/v1/nexrad/azimuth?RadarFile=KTLX20130520_200356_V06').then(response => {return response});

        console.log(reflectivity);
    }
})