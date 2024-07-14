// Set up the scene, camera, and renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

// Create a simple light
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(5, 10, 7.5).normalize();
light.castShadow = true;
scene.add(light);

// Create ambient light for softer shadows
const ambientLight = new THREE.AmbientLight(0x404040);
scene.add(ambientLight);

// Define the maze with an entrance and exit
const maze = [
    [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1],
    [1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 1],
    [1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 0, 1],
    [1, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1],
    [1, 1, 1, 0, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1],
    [1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 1],
    [1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 0, 0],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
];

// Create maze walls
const wallGeometry = new THREE.BoxGeometry(1, 1, 1);
const wallMaterial = new THREE.MeshLambertMaterial({ color: 0x888888 });
maze.forEach((row, z) => {
    row.forEach((cell, x) => {
        if (cell === 1) {
            const wall = new THREE.Mesh(wallGeometry, wallMaterial);
            wall.position.set(x, 0.5, z);
            wall.castShadow = true;
            wall.receiveShadow = true;
            scene.add(wall);
        }
    });
});

// Create the floor
const floorGeometry = new THREE.PlaneGeometry(maze[0].length, maze.length);
const floorMaterial = new THREE.MeshLambertMaterial({ color: 0xaaaaaa });
const floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.rotation.x = -Math.PI / 2;
floor.position.set(maze[0].length / 2 - 0.5, 0, maze.length / 2 - 0.5);
floor.receiveShadow = true;
scene.add(floor);

// Create player
const playerGeometry = new THREE.SphereGeometry(0.3, 32, 32);
const playerMaterial = new THREE.MeshLambertMaterial({ color: 0xff0000 });
const player = new THREE.Mesh(playerGeometry, playerMaterial);
player.position.set(0.5, 0.3, 0.5);
player.castShadow = true;
scene.add(player);

// Create entrance and exit signs
const loader = new THREE.FontLoader();
loader.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', function(font) {
    const entranceGeometry = new THREE.TextGeometry('Enter Here', {
        font: font,
        size: 0.5,
        height: 0.1
    });
    const entranceMaterial = new THREE.MeshLambertMaterial({ color: 0x00ff00 });
    const entranceMesh = new THREE.Mesh(entranceGeometry, entranceMaterial);
    entranceMesh.position.set(0.5, 1, 0);
    scene.add(entranceMesh);

    const exitGeometry = new THREE.TextGeometry('Exit Here', {
        font: font,
        size: 0.5,
        height: 0.1
    });
    const exitMaterial = new THREE.MeshLambertMaterial({ color: 0xff0000 });
    const exitMesh = new THREE.Mesh(exitGeometry, exitMaterial);
    exitMesh.position.set(maze[0].length - 1.5, 1, maze.length - 2.5);
    scene.add(exitMesh);
});

// Position the camera
camera.position.set(1, 5, 7);
camera.lookAt(player.position);

// Player controls
const controls = {
    forward: false,
    backward: false,
    left: false,
    right: false
};

document.addEventListener('keydown', (event) => {
    switch (event.key) {
        case 'ArrowUp':
        case 'w':
            controls.forward = true;
            break;
        case 'ArrowDown':
        case 's':
            controls.backward = true;
            break;
        case 'ArrowLeft':
        case 'a':
            controls.left = true;
            break;
        case 'ArrowRight':
        case 'd':
            controls.right = true;
            break;
    }
});

document.addEventListener('keyup', (event) => {
    switch (event.key) {
        case 'ArrowUp':
        case 'w':
            controls.forward = false;
            break;
        case 'ArrowDown':
        case 's':
            controls.backward = false;
            break;
        case 'ArrowLeft':
        case 'a':
            controls.left = false;
            break;
        case 'ArrowRight':
        case 'd':
            controls.right = false;
            break;
    }
});

// Check for collisions with walls
function checkCollision(x, z) {
    const mazeX = Math.floor(x);
    const mazeZ = Math.floor(z);
    return maze[mazeZ] && maze[mazeZ][mazeX] === 1;
}

// Check if the player has reached the exit
function checkExit(x, z) {
    const mazeX = Math.floor(x);
    const mazeZ = Math.floor(z);
    return mazeZ === maze.length - 2 && mazeX === maze[0].length - 2;
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);

    const speed = 0.05;
    let newX = player.position.x;
    let newZ = player.position.z;

    if (controls.forward) newZ -= speed;
    if (controls.backward) newZ += speed;
    if (controls.left) newX -= speed;
    if (controls.right) newX += speed;

    if (!checkCollision(newX, player.position.z)) player.position.x = newX;
    if (!checkCollision(player.position.x, newZ)) player.position.z = newZ;

    camera.position.set(player.position.x, 5, player.position.z + 5);
    camera.lookAt(player.position);

    if (checkExit(player.position.x, player.position.z)) {
        document.getElementById('congrats').style.display = 'block';
    }

    renderer.render(scene, camera);
}

animate();
