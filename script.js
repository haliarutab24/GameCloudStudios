const burger = document.querySelector('.burger');
const navLinks = document.querySelector('.nav-links');

// Three.js setup
function initializeThreeJS() {
    const canvasContainer = document.getElementById('three-canvas');
    if (!canvasContainer) return; // Skip if canvas container is not found

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    canvasContainer.appendChild(renderer.domElement);

    // Create neon grid (wireframe cube)
    const gridGeometry = new THREE.BoxGeometry(3, 3, 3);
    const edges = new THREE.EdgesGeometry(gridGeometry);
    const gridMaterial = new THREE.LineBasicMaterial({ color: 0x8a2be2, linewidth: 2 });
    const grid = new THREE.LineSegments(edges, gridMaterial);
    scene.add(grid);

    // Add glowing effect with ShaderMaterial
    const glowGeometry = new THREE.BoxGeometry(3.2, 3.2, 3.2);
    const glowMaterial = new THREE.ShaderMaterial({
        uniforms: {
            color: { value: new THREE.Color(0xb76cfd) },
            opacity: { value: 0.3 }
        },
        vertexShader: `
            void main() {
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            uniform vec3 color;
            uniform float opacity;
            void main() {
                float distance = length(gl_PointCoord - vec2(0.5));
                if (distance > 0.5) discard;
                gl_FragColor = vec4(color, opacity * smoothstep(0.5, 0.0, distance));
            }
        `,
        transparent: true
    });
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    glow.material.depthWrite = false;
    scene.add(glow);

    // Particle effects
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesMaterial = new THREE.PointsMaterial({ color: 0x00f0ff, size: 0.1, transparent: true });
    const particlePositions = [];
    for (let i = 0; i < 200; i++) {
        const distance = 4 + Math.random() * 2;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.random() * Math.PI;
        particlePositions.push(
            distance * Math.sin(phi) * Math.cos(theta),
            distance * Math.sin(phi) * Math.sin(theta),
            distance * Math.cos(phi)
        );
    }
    particlesGeometry.setAttribute('position', new THREE.Float32BufferAttribute(particlePositions, 3));
    const particles = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particles);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);
    const pointLight = new THREE.PointLight(0xffffff, 0.8, 100);
    pointLight.position.set(5, 5, 5);
    scene.add(pointLight);

    camera.position.z = 6;

    function animate() {
        requestAnimationFrame(animate);
        grid.rotation.x += 0.005;
        grid.rotation.y += 0.007;
        glow.rotation.copy(grid.rotation);
        particles.rotation.y += 0.003;
        renderer.render(scene, camera);
    }
    animate();

    // Handle window resize
    window.addEventListener('resize', () => {
        renderer.setSize(window.innerWidth, window.innerHeight);
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
    });
}

// Initialize Three.js on page load
document.addEventListener('DOMContentLoaded', initializeThreeJS);

// Navbar toggle
burger.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    burger.classList.toggle('toggle');
});

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth'
            });
        }
    });
});