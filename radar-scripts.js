var scene = new THREE.Scene();
var renderer = new THREE.WebGLRenderer();
let totalScans = 0;
let currentScan = 1;
let totalPoints = 0;

var canvasRenderer = document.getElementById('canvas-renderer');
renderer.setSize(canvasRenderer.offsetWidth-17, window.innerHeight);
document.getElementById('canvas-renderer').append(renderer.domElement);
renderer.setClearColor(0x262626, 1);

$(function () {
    var socket = new io();
    var cameraPosition = 100;
    var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

    $("#load-file").click(function () {
        var radarFile = $("#radar-file-list option:selected").val();
        $("#radar-location").text(radarFile.substr(0,4));
        socket.emit('load-file', radarFile);
    });

    $("#start-sweep").click(function () {
        socket.emit('sweep');
    });

    $("#clear-image").click(function() {
        clearScene();
    });

    function clearScene() {
        totalPoints = 0;
        $("#data-points-rendered").text(Number(totalPoints).toLocaleString());

        while(scene.children.length > 0) {
            scene.remove(scene.children[0]);
        }
    }

    socket.on('set-scans', function (data) {
        totalScans = data;
        console.log(`Found ${data} scans`);
        
        clearScene();
    })

    socket.on('plot-data', function (data) {
        var reflectivityColourScale = d3.scaleQuantize().domain([-32.0, 94.5]).range(reflectivityColours);
        var pointsMaterial = new THREE.PointsMaterial({
            size: 2,
            vertexColors: THREE.VertexColors,
            sizeAttenuation: false
        });

        var x = data.x;
        var y = data.y;
        var reflectivity = data.reflectivity;
        var geometry = new THREE.Geometry();

        x.forEach(function (item, index) {
            if (reflectivity.MomentDataValues[index] > -33) {
                geometry.vertices.push(new THREE.Vector3(x[index], y[index], 0));
                geometry.colors.push(new THREE.Color(reflectivityColourScale(reflectivity.MomentDataValues[index])));
                updateDiagnostics();
            }
        });

        var points = new THREE.Points(geometry, pointsMaterial);
        scene.add(points);
    });

    function renderScene() {
        requestAnimationFrame(renderScene);
        camera.position.z = cameraPosition;
        renderer.render(scene, camera);
    }

    function updateDiagnostics() {
        totalPoints++;
        $("#data-points-rendered").text(Number(totalPoints).toLocaleString());
    }

    renderScene();
});