import { Component, ElementRef, ViewChild, AfterViewInit, NgZone, HostListener } from '@angular/core';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

interface Skill {
  name: string;
  icon: string;
  size: number;
  color: string;
  x: number;
  y: number;
  z: number;
  experience: string;
}

@Component({
  selector: 'app-skill-galaxy',
  templateUrl: './skill-galaxy.component.html',
  styleUrls: ['./skill-galaxy.component.scss']
})
export class SkillGalaxyComponent implements AfterViewInit {
  @ViewChild('galaxyCanvas', { static: true }) 
  private galaxyCanvas!: ElementRef<HTMLCanvasElement>;

  skills: Skill[] = [
    { name: 'Angular', icon: '../../../assets/img/icons/angular.svg', size: 1.2, color: '#DD0031', x: 0, y: 0, z: 0, experience: '2 años' },
    { name: 'React', icon: '../../../assets/img/icons/react.svg', size: 1.0, color: '#61DAFB', x: 0, y: 0, z: 0, experience: '1 año' },
    { name: 'SASS', icon: '../../../assets/img/icons/sass.svg', size: 0.9, color: '#CF649A', x: 0, y: 0, z: 0, experience: '2 años' },
    { name: 'HTML5', icon: '../../../assets/img/icons/html5.svg', size: 1.0, color: '#E44D26', x: 0, y: 0, z: 0, experience: '3 años' },
    { name: 'CSS3', icon: '../../../assets/img/icons/css3.svg', size: 0.9, color: '#264DE4', x: 0, y: 0, z: 0, experience: '3 años' },
    { name: 'GitHub', icon: '../../../assets/img/icons/github.svg', size: 0.9, color: '#181717', x: 0, y: 0, z: 0, experience: '2 años' },
  ];

  public selectedSkill: Skill | null = null;
  public showClickPrompt = true; // Cambiado a público
  
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private controls!: OrbitControls;
  private animationId!: number;
  private tooltipTimeout!: any;

  constructor(private ngZone: NgZone) {}

  ngAfterViewInit(): void {
    this.initGalaxy();
    this.animate();
    
    // Mostrar indicación de click después de 3 segundos
    this.tooltipTimeout = setTimeout(() => {
      this.showClickPrompt = false;
    }, 5000);
  }

  ngOnDestroy(): void {
    cancelAnimationFrame(this.animationId);
    window.removeEventListener('resize', this.onWindowResize);
    clearTimeout(this.tooltipTimeout);
    if (this.renderer) {
      this.renderer.dispose();
    }
  }

  private initGalaxy(): void {
    // 1. Configuración inicial
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x000814);

    // 2. Configuración de cámara ajustada al componente
    const canvasWidth = this.galaxyCanvas.nativeElement.clientWidth;
    const canvasHeight = this.galaxyCanvas.nativeElement.clientHeight;
    this.camera = new THREE.PerspectiveCamera(45, canvasWidth / canvasHeight, 0.1, 1000);
    
    // 3. Renderer optimizado
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.galaxyCanvas.nativeElement,
      antialias: true,
      powerPreference: "high-performance"
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(canvasWidth, canvasHeight);

    // 4. Iluminación
    const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 5, 5);
    this.scene.add(directionalLight);

    // 5. Crear elementos
    this.createStars();
    this.createAndDistributePlanets();
    this.setupControls();

    // 6. Interactividad
    this.addInteractivity();
    window.addEventListener('resize', () => this.onWindowResize());
  }

  private createStars(): void {
    const starsGeometry = new THREE.BufferGeometry();
    const starsMaterial = new THREE.PointsMaterial({
      color: 0xFFFFFF,
      size: 0.15,
      transparent: true,
      opacity: 0.8
    });

    const vertices = [];
    for (let i = 0; i < 1500; i++) {
      vertices.push(
        (Math.random() - 0.5) * 2000,
        (Math.random() - 0.5) * 2000,
        (Math.random() - 0.5) * 2000
      );
    }

    starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    const stars = new THREE.Points(starsGeometry, starsMaterial);
    this.scene.add(stars);
  }

  private createAndDistributePlanets(): void {
    const radius = 8;
    const count = this.skills.length;
    
    // Distribución en espiral Fibonacci
    const goldenRatio = (1 + Math.sqrt(5)) / 2;
    
    this.skills.forEach((skill, index) => {
      const theta = 2 * Math.PI * index / goldenRatio;
      const phi = Math.acos(1 - 2 * (index + 0.5) / count);
      
      skill.x = radius * Math.cos(theta) * Math.sin(phi);
      skill.y = radius * Math.sin(theta) * Math.sin(phi);
      skill.z = radius * Math.cos(phi);

      const geometry = new THREE.SphereGeometry(skill.size, 32, 32);
      const material = new THREE.MeshPhongMaterial({
        color: new THREE.Color(skill.color),
        shininess: 100,
        emissive: new THREE.Color(skill.color).clone().multiplyScalar(0.2)
      });

      const planet = new THREE.Mesh(geometry, material);
      planet.position.set(skill.x, skill.y, skill.z);
      planet.userData = skill;
      this.scene.add(planet);

      // Efecto de anillo para tecnologías principales
      if (['Angular', 'React', 'GitHub'].includes(skill.name)) {
        const ringGeometry = new THREE.RingGeometry(skill.size * 1.2, skill.size * 1.4, 32);
        const ringMaterial = new THREE.MeshBasicMaterial({
          color: new THREE.Color(skill.color),
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.4
        });
        const ring = new THREE.Mesh(ringGeometry, ringMaterial);
        ring.rotation.x = Math.PI / 2;
        planet.add(ring);
      }
    });

    // Posición inicial de la cámara para ver todos los planetas
    this.camera.position.z = radius * 2.5;
    this.controls?.update();
  }

  private setupControls(): void {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.rotateSpeed = 0.5;
    this.controls.zoomSpeed = 0.8;
    
    // Limitar zoom para que no se salga del componente
    const canvasHeight = this.galaxyCanvas.nativeElement.clientHeight;
    this.controls.minDistance = 10;
    this.controls.maxDistance = 30;
    
    // Auto-rotación inicial
    this.controls.autoRotate = true;
    this.controls.autoRotateSpeed = 0.5;
    
    // Mejor manejo del scroll
    this.controls.addEventListener('change', () => {
      if (this.controls.getDistance() < 15) {
        this.galaxyCanvas.nativeElement.style.pointerEvents = 'none';
      } else {
        this.galaxyCanvas.nativeElement.style.pointerEvents = 'auto';
      }
    });
  }

  private addInteractivity(): void {
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();

    const handleInteraction = (event: MouseEvent | TouchEvent) => {
      // Coordenadas normalizadas
      if (event instanceof TouchEvent) {
        const touch = event.touches[0] || event.changedTouches[0];
        pointer.x = (touch.clientX / window.innerWidth) * 2 - 1;
        pointer.y = - (touch.clientY / window.innerHeight) * 2 + 1;
      } else {
        pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
        pointer.y = - (event.clientY / window.innerHeight) * 2 + 1;
      }

      raycaster.setFromCamera(pointer, this.camera);
      const intersects = raycaster.intersectObjects(this.scene.children);

      this.ngZone.run(() => {
        if (intersects.length > 0) {
          const userData = intersects[0].object.userData;
          // Acceso seguro a propiedades usando notación de corchetes
          if (userData && userData['name'] && userData['experience']) {
            this.selectedSkill = {
              name: userData['name'],
              icon: userData['icon'],
              size: userData['size'],
              color: userData['color'],
              x: userData['x'],
              y: userData['y'],
              z: userData['z'],
              experience: userData['experience']
            };
            this.showClickPrompt = false;
          }
        } else {
          this.selectedSkill = null;
        }
      });
    };

    this.galaxyCanvas.nativeElement.addEventListener('click', handleInteraction);
    this.galaxyCanvas.nativeElement.addEventListener('touchstart', handleInteraction);
  }

  private onWindowResize(): void {
    const canvasWidth = this.galaxyCanvas.nativeElement.clientWidth;
    const canvasHeight = this.galaxyCanvas.nativeElement.clientHeight;
    
    this.camera.aspect = canvasWidth / canvasHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(canvasWidth, canvasHeight);
  }

  private animate(): void {
    this.ngZone.runOutsideAngular(() => {
      const animationLoop = () => {
        this.animationId = requestAnimationFrame(animationLoop);
        this.controls.update();
        this.renderer.render(this.scene, this.camera);
      };
      animationLoop();
    });
  }
}