import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.152.2/build/three.module.js';
import * as CANNON from 'https://cdn.jsdelivr.net/npm/cannon-es@0.20.0/dist/cannon-es.js';

class NewtonGame {
  constructor() {
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.world = null;
    this.objects = [];
    this.tempVisuals = []; // For temporary objects like force arrows
    this.keys = {};
    this.activeScene = null;
    this.law2Masses = [1, 5, 10]; // Default masses for the second law
    this.law2Force = 30; // The magnitude of the impulse force in Newtons
  }

  init() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xeeeeee);
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    document.body.appendChild(this.renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
    this.scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.7);
    directionalLight.position.set(10, 15, 10);
    directionalLight.castShadow = true;
    // --- AESTHETICS: Adjust shadow camera for the new platform size ---
    directionalLight.shadow.camera.top = 20;
    directionalLight.shadow.camera.bottom = -20;
    directionalLight.shadow.camera.left = -20;
    directionalLight.shadow.camera.right = 20;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    this.scene.add(directionalLight);

    this.initControls();
    this.setupSceneSelector();

    this.camera.position.set(0, 8, 18); // Move camera slightly to see the platform better
    this.camera.lookAt(0, 0, 0);

    this.loadScene('law1'); // Load the first scene by default
    this.animate();
  }

  initControls() {
    window.addEventListener("keydown", e => this.keys[e.code] = true);
    window.addEventListener("keyup", e => this.keys[e.code] = false);
  }

  setupSceneSelector() {
    document.getElementById('btn-law1').addEventListener('click', () => this.loadScene('law1'));
    document.getElementById('btn-law2').addEventListener('click', () => this.loadScene('law2'));
    document.getElementById('btn-law3').addEventListener('click', () => this.loadScene('law3'));
  }

  clearScene() {
    // Clear dynamic objects
    this.objects.forEach(obj => {
        if (obj.mesh) this.scene.remove(obj.mesh);
    });
     // Clear temporary visuals
    this.tempVisuals.forEach(v => this.scene.remove(v));
    // Clear static scene elements like the floor and grid
    if (this.floorMesh) this.scene.remove(this.floorMesh);
    if (this.grid) this.scene.remove(this.grid);

    if (this.world) {
      while (this.world.bodies.length > 0) {
        this.world.removeBody(this.world.bodies[0]);
      }
    }
    this.objects = [];
    this.tempVisuals = [];
  }

  loadScene(sceneId) {
    const isReloading = this.activeScene === sceneId;
    this.activeScene = sceneId;

    document.querySelectorAll('#scene-selector button').forEach(btn => {
      btn.classList.remove('active');
    });
    document.getElementById(`btn-${sceneId}`).classList.add('active');

    if (!isReloading) {
        this.world = new CANNON.World({ gravity: new CANNON.Vec3(0, -9.82, 0) });
    }
    
    this.clearScene();
    this.addFloor();

    if (sceneId === 'law1') this.setupLaw1();
    if (sceneId === 'law2') this.setupLaw2();
    if (sceneId === 'law3') this.setupLaw3();
  }
  
  addFloor() {
    const platformSize = { width: 30, height: 1, depth: 30 };

    // --- AESTHETICS: Visual Platform ---
    const floorGeometry = new THREE.BoxGeometry(platformSize.width, platformSize.height, platformSize.depth);
    const floorMaterial = new THREE.MeshStandardMaterial({ color: 0xcccccc });
    this.floorMesh = new THREE.Mesh(floorGeometry, floorMaterial);
    this.floorMesh.position.y = -platformSize.height / 2;
    this.floorMesh.receiveShadow = true;
    this.scene.add(this.floorMesh);

    this.grid = new THREE.GridHelper(platformSize.width, platformSize.width, 0x888888, 0xbbbbbb);
    this.grid.position.y = platformSize.height / 2; // Place grid on top of the box
    this.floorMesh.add(this.grid); // Add grid as a child of the floor mesh

    // --- PHYSICS: Finite Platform ---
    const floorShape = new CANNON.Box(new CANNON.Vec3(platformSize.width / 2, platformSize.height / 2, platformSize.depth / 2));
    const floorBody = new CANNON.Body({ mass: 0, shape: floorShape });
    floorBody.position.y = -platformSize.height / 2;
    this.world.addBody(floorBody);
  }

  setupLaw1() {
    document.getElementById('scene-info').innerHTML = `
      <p>Un objeto en reposo (azul) y otro en movimiento (verde).</p>
      <p>Presiona <strong>F</strong> para aplicar una fuerza al objeto azul y romper su inercia.</p>
    `;

    const radius = 0.5;
    const sphereGeometry = new THREE.SphereGeometry(radius, 32, 32);

    const sphere1Material = new THREE.MeshStandardMaterial({ color: 0x1f77b4, metalness: 0.7, roughness: 0.2 });
    const sphere1Mesh = new THREE.Mesh(sphereGeometry, sphere1Material);
    sphere1Mesh.castShadow = true;
    this.scene.add(sphere1Mesh);
    const sphere1Body = new CANNON.Body({ mass: 5, shape: new CANNON.Sphere(radius), position: new CANNON.Vec3(-3, radius, 0) });
    this.world.addBody(sphere1Body);
    this.objects.push({ mesh: sphere1Mesh, body: sphere1Body, id: 'resting_sphere' });

    const sphere2Material = new THREE.MeshStandardMaterial({ color: 0x2ca02c, metalness: 0.7, roughness: 0.2 });
    const sphere2Mesh = new THREE.Mesh(sphereGeometry, sphere2Material);
    sphere2Mesh.castShadow = true;
    this.scene.add(sphere2Mesh);
    const sphere2Body = new CANNON.Body({ mass: 2, shape: new CANNON.Sphere(radius), position: new CANNON.Vec3(3, radius, 0), velocity: new CANNON.Vec3(-5, 0, 0) });
    this.world.addBody(sphere2Body);
    this.objects.push({ mesh: sphere2Mesh, body: sphere2Body });
  }

  setupLaw2() {
    const sceneInfo = document.getElementById('scene-info');
    sceneInfo.innerHTML = `
      <p>Define la fuerza y las masas. Presiona <strong>F</strong> para aplicar la fuerza.</p>
      <div id="force-control"></div>
      <div id="mass-controls"></div>
    `;
    
    const forceControl = document.getElementById('force-control');
    const forceLabel = document.createElement('label');
    forceLabel.innerText = 'Fuerza (N):';
    const forceInput = document.createElement('input');
    forceInput.type = 'number';
    forceInput.id = 'force-input';
    forceInput.value = this.law2Force;
    forceInput.min = "1";
    forceControl.appendChild(forceLabel);
    forceControl.appendChild(forceInput);

    const massControls = document.getElementById('mass-controls');
    this.law2Masses.forEach((mass, i) => {
      const controlGroup = document.createElement('div');
      controlGroup.className = 'mass-control-group';
      
      const label = document.createElement('label');
      label.innerText = `Masa ${i + 1}:`;
      
      const input = document.createElement('input');
      input.type = 'number';
      input.value = mass;
      input.id = `mass-input-${i}`;
      input.min = "0.1";
      input.step = "0.1";

      const acceleration = (this.law2Force / mass).toFixed(2);
      const accelDisplay = document.createElement('span');
      accelDisplay.innerText = `a = ${acceleration} m/s²`;
      
      controlGroup.appendChild(label);
      controlGroup.appendChild(input);
      controlGroup.appendChild(accelDisplay);
      massControls.appendChild(controlGroup);
    });

    const resetButton = document.createElement('button');
    resetButton.innerText = 'Aplicar y Reiniciar';
    resetButton.onclick = () => {
      const forceInputVal = document.getElementById('force-input').value;
      this.law2Force = parseFloat(forceInputVal) || 30;

      this.law2Masses = this.law2Masses.map((_, i) => {
        const inputVal = document.getElementById(`mass-input-${i}`).value;
        return parseFloat(inputVal) || 1;
      });
      this.loadScene('law2');
    };
    massControls.appendChild(resetButton);

    const colors = [0x2ca02c, 0x1f77b4, 0xd62728];

    for (let i = 0; i < this.law2Masses.length; i++) {
      const mass = this.law2Masses[i];
      const radius = 0.25 * Math.cbrt(mass);
      const geometry = new THREE.SphereGeometry(radius, 32, 32);
      const material = new THREE.MeshStandardMaterial({ color: colors[i], metalness: 0.7, roughness: 0.2 });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.castShadow = true;
      this.scene.add(mesh);

      const body = new CANNON.Body({ mass, shape: new CANNON.Sphere(radius), position: new CANNON.Vec3(-5 + i * 5, radius, 0) });
      this.world.addBody(body);
      this.objects.push({ mesh, body });
    }
  }

  setupLaw3() {
    document.getElementById('scene-info').innerHTML = `
      <p>Dos objetos colisionan. Observa cómo sus movimientos cambian debido a fuerzas iguales y opuestas.</p>
      <p>Presiona <strong>R</strong> para reiniciar la simulación.</p>
    `;

    const radius = 0.5;
    const sphereGeometry = new THREE.SphereGeometry(radius, 32, 32);

    const sphere1Material = new THREE.MeshStandardMaterial({ color: 0x1f77b4, metalness: 0.7, roughness: 0.2 });
    const sphere1Mesh = new THREE.Mesh(sphereGeometry, sphere1Material);
    sphere1Mesh.castShadow = true;
    this.scene.add(sphere1Mesh);
    const sphere1Body = new CANNON.Body({ mass: 5, shape: new CANNON.Sphere(radius), position: new CANNON.Vec3(-10, radius, 0), velocity: new CANNON.Vec3(8, 0, 0) });
    this.world.addBody(sphere1Body);
    this.objects.push({ mesh: sphere1Mesh, body: sphere1Body });

    const sphere2Material = new THREE.MeshStandardMaterial({ color: 0xd62728, metalness: 0.7, roughness: 0.2 });
    const sphere2Mesh = new THREE.Mesh(sphereGeometry, sphere2Material);
    sphere2Mesh.castShadow = true;
    this.scene.add(sphere2Mesh);
    const sphere2Body = new CANNON.Body({ mass: 5, shape: new CANNON.Sphere(radius), position: new CANNON.Vec3(10, radius, 0), velocity: new CANNON.Vec3(-8, 0, 0) });
    this.world.addBody(sphere2Body);
    this.objects.push({ mesh: sphere2Mesh, body: sphere2Body });
  }

  showForceVectors() {
    const forceDirection = new THREE.Vector3(0, 0, -1);
    const arrowLength = 1.5;
    const arrowColor = 0xffff00;

    this.objects.forEach(obj => {
      const arrow = new THREE.ArrowHelper(forceDirection, obj.mesh.position, arrowLength, arrowColor);
      this.scene.add(arrow);
      this.tempVisuals.push(arrow);
    });

    setTimeout(() => {
      this.tempVisuals.forEach(v => this.scene.remove(v));
      this.tempVisuals = [];
    }, 500);
  }

  updatePhysics() {
    if (!this.world) return;
    this.world.step(1 / 60);
    for (const obj of this.objects) {
      obj.mesh.position.copy(obj.body.position);
      obj.mesh.quaternion.copy(obj.body.quaternion);
    }
  }

  animate() {
    requestAnimationFrame(() => this.animate());
    
    if (this.activeScene === 'law1' && this.keys["KeyF"]) {
        const restingSphere = this.objects.find(o => o.id === 'resting_sphere');
        if (restingSphere) restingSphere.body.applyImpulse(new CANNON.Vec3(0, 0, -15), restingSphere.body.position);
    } else if (this.activeScene === 'law2' && this.keys["KeyF"]) {
        const impulse = new CANNON.Vec3(0, 0, -this.law2Force);
        this.objects.forEach(obj => obj.body.applyImpulse(impulse, obj.body.position));
        if (this.tempVisuals.length === 0) {
          this.showForceVectors();
        }
    } else if (this.activeScene === 'law3' && this.keys["KeyR"]) {
        this.loadScene('law3');
    }
    
    this.updatePhysics();
    this.renderer.render(this.scene, this.camera);
  }
}

const game = new NewtonGame();
game.init();
