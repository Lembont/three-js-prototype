import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';

// Créer la scène
const scene = new THREE.Scene();

// Créer la caméra (perspective)
const camera = new THREE.PerspectiveCamera(
    40, // angle de vue
    window.innerWidth / window.innerHeight, // ratio largeur/hauteur
    0.1, // plan proche
    1000 // plan lointain
);

const cameraAmplitude = 0.2; // Amplitude du mouvement de respiration
const cameraSpeed = 0.2; // Vitesse du mouvement de respiration
let time = 0; // Variable pour suivre le temps

// Créer le renderer pour dessiner la scène
const renderer = new THREE.WebGLRenderer({ antialias: true }); // Activer l'anticrénelage
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true; // Activer les ombres
document.body.appendChild(renderer.domElement); // Ajouter le rendu au DOM

// Positionner la caméra
camera.position.set(15, 10, 15);
camera.lookAt(0, -60, -90);

// Charger le modèle GLTF
const loader = new GLTFLoader();
loader.load(
    'book.gltf', // Remplace par le chemin vers ton modèle
    (gltf) => {
        gltf.scene.scale.set(10, 10, 10);
        gltf.scene.rotation.set(0, 0, 0);
        gltf.scene.position.set(0, 0, 3);
        gltf.scene.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true;  // Projeter des ombres
                child.receiveShadow = true; // Recevoir des ombres (si nécessaire)
            }
        });
        scene.add(gltf.scene);
    },
    (xhr) => {
        console.log((xhr.loaded / xhr.total * 100) + '% loaded'); // Progression du chargement
    },
    (error) => {
        console.error('An error occurred', error); // Gestion des erreurs
    }
);

// Charger la texture
const textureLoader = new THREE.TextureLoader();
const texture = textureLoader.load('texture-bois.jpg'); // Remplace par le chemin de ta texture

const cube = new THREE.Mesh(
    new THREE.BoxGeometry(20, 10, 25),
    new THREE.MeshStandardMaterial({
        map: texture,
        metalness: 0.5, // Contrôle le degré de métal
        roughness: 0.5  // Contrôle la rugosité de la surface
    })
);

cube.receiveShadow = true;
cube.castShadow = true;
scene.add(cube);

cube.position.y = -4.85;
cube.position.x = 12;
cube.position.z = 5;

// Ajouter une lumière directionnelle au-dessus du cube
const directionalLight = new THREE.DirectionalLight(0xffffff, 3); // Intensité augmentée
directionalLight.castShadow = true;
directionalLight.position.set(15, 20, 10); // Positionnée au-dessus du cube
scene.add(directionalLight);

// Ajouter une lumière ambiante douce
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5); // Lumière ambiante
scene.add(ambientLight);

// Ajouter une lumière de point au-dessus du modèle GLTF
const pointLight = new THREE.PointLight(0xffcc00, 2); // Lumière orange plus saturée et plus intense
pointLight.position.set(0, 10, 0); // Positionnée au-dessus du modèle GLTF
scene.add(pointLight);

// Configuration du composer pour le bloom
const composer = new EffectComposer(renderer);
const renderPass = new RenderPass(scene, camera);
composer.addPass(renderPass);

const bloomPass = new UnrealBloomPass();
bloomPass.threshold = 0.3; // Ajuster le seuil du bloom
bloomPass.strength = 1.0; // Force de l'effet de bloom augmentée
bloomPass.radius = 1; // Rayon de l'effet de bloom
composer.addPass(bloomPass);

// Shader de pixelisation
const pixelShader = {
    uniforms: {
        tDiffuse: { value: null },
        pixelSize: { value: 230.0 } // Taille des pixels
    },
    vertexShader: `
        varying vec2 vUv;
        void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
    fragmentShader: `
        uniform sampler2D tDiffuse;
        uniform float pixelSize;
        varying vec2 vUv;
        
        void main() {
            vec2 uv = floor(vUv * pixelSize) / pixelSize; // Pixelisation
            gl_FragColor = texture2D(tDiffuse, uv);
        }
    `
};

// Ajouter le ShaderPass pour la pixelisation
const pixelPass = new ShaderPass(pixelShader);
composer.addPass(pixelPass);



// Charger une police et créer le texte 3D
const fontLoader = new FontLoader();
fontLoader.load('node_modules/three/examples/fonts/helvetiker_regular.typeface.json', (font) => {
    const textGeometry = new TextGeometry('Hello, 3D World!', {
        font: font,
        size: 1, // Taille du texte
        depth: 0.01, // Épaisseur
        curveSegments: 12, // Segments de courbe pour arrondir les lettres
        bevelEnabled: false, // Activer l'angle de biseau
        bevelThickness: 0.01, // Épaisseur du biseau
        bevelSize: 0.1, // Taille du biseau
        bevelOffset: 0, // Décalage du biseau
        bevelSegments: 2 // Segments de biseau
    });

    const textMaterial = new THREE.MeshStandardMaterial({ color: 0x000000 }); // Matériau du texte
    const textMesh = new THREE.Mesh(textGeometry, textMaterial);
    textMesh.position.set(8, 2, 5); // Positionner le texte
    scene.add(textMesh);
    
});

// Fonction d'animation
function animate() {
    requestAnimationFrame(animate);
    time += 0.02; // Augmenter le temps
    camera.position.y = 9 + cameraAmplitude * Math.sin(time * cameraSpeed); // Calculer la nouvelle position y

    // Changer la couleur de la lumière de point
    const color = new THREE.Color(`hsl(${(time * 60) % 360}, 100%, 50%)`); // Change entre orange et blanc
    pointLight.color.copy(color);

    composer.render(); // Rendre la scène avec le composer
}

// Écouter le redimensionnement de la fenêtre
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    composer.setSize(window.innerWidth, window.innerHeight); // Ajuster la taille du composer
});

animate();
