var scene = new THREE.Scene();
var renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.append(renderer.domElement);
let totalScans = 0;
let currentScan = 1;

$(function () {
    var socket = new io();
    var cameraPosition = 100;
    var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

    $("#load-file").click(function () {
        socket.emit('load-file', 'KTLX20130520_200356_V06');
    });

    $("#start-sweep").click(function () {
        // for(let i = currentScan; i < totalScans; i++) {
        socket.emit('sweep');
        // }
    });

    socket.on('set-scans', function (data) {
        totalScans = data;
        console.log(`Found ${data} scans`);
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

    renderScene();
});