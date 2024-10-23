// Créer la scène
const scene = new THREE.Scene();

// Créer la caméra (perspective)
const camera = new THREE.PerspectiveCamera(
    80, // angle de vue
    window.innerWidth / window.innerHeight, // ratio largeur/hauteur
);

// Créer le renderer pour dessiner la scène
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement); // Ajouter le rendu au DOM

// Positionner la caméra
camera.position.z = 5;
camera.position.y = 2;


// Créer une géométrie (un cube)
const geometry = new THREE.BoxGeometry(1, 1, 1);

// Créer un matériau basique avec une couleur
const material = new THREE.MeshPhongMaterial({ color: 0x33ccff });

// Créer un objet Mesh (géométrie + matériau)
const cube = new THREE.Mesh(geometry, material);
const cube2 = new THREE.Mesh(geometry, material);

// Ajouter le cube à la scène
scene.add(cube);
scene.add(cube2);

const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(5, 5, 5);
scene.add(light);

function animate() {
    requestAnimationFrame(animate);

    // Faire tourner le cube
    // cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;
    cube2.rotation.y += -0.01;
    // cube.rotation.z += 0.04;

    renderer.render(scene, camera);
}

// Lancer l'animation
   // Rendu de la scène avec la caméra
   renderer.render(scene, camera);



clickButton = document.getElementById("button");
clickButton.addEventListener("click", () => {
    animate();
});


