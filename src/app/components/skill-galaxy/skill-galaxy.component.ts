import { animate, style, transition, trigger } from '@angular/animations';
import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild, AfterViewInit, NgZone } from '@angular/core';
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
  styleUrls: ['./skill-galaxy.component.scss'],
  animations: [
    // Animación para el tooltip
    trigger('pulse', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ opacity: 0, transform: 'translateY(20px)' }))
      ])
    ]),
    // Animación para el prompt de click
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('500ms ease-out', style({ opacity: 1 }))
      ]),
      transition(':leave', [
        animate('300ms ease-in', style({ opacity: 0 }))
      ])
    ])
  ]
})
export class SkillGalaxyComponent implements AfterViewInit {
  @ViewChild('galaxyCanvas', { static: true }) 
  private galaxyCanvas!: ElementRef<HTMLCanvasElement>;

  // Habilidades públicas para el template
  public skills: Skill[] = [
    { name: 'Angular', icon: '../../../assets/img/icons/angular.svg', size: 1.2, color: '#DD0031', x: 0, y: 0, z: 0, experience: '2+ años' },
    { name: 'React', icon: '../../../assets/img/icons/react.svg', size: 1.0, color: '#61DAFB', x: 0, y: 0, z: 0, experience: '1+ año' },
    { name: 'Sass', icon: '../../../assets/img/icons/sass.svg', size: 0.9, color: '#CC6699', x: 0, y: 0, z: 0, experience: '2+ años' },
    { name: 'HTML5', icon: '../../../assets/img/icons/html5.svg', size: 1.0, color: '#E34F26', x: 0, y: 0, z: 0, experience: '3+ años' },
    { name: 'CSS3', icon: '../../../assets/img/icons/css3.svg', size: 0.9, color: '#1572B6', x: 0, y: 0, z: 0, experience: '3+ años' },
    { name: 'Github', icon: '../../../assets/img/icons/github.svg', size: 0.9, color: '#F05032', x: 0, y: 0, z: 0, experience: '2+ años' },
  ];

  public selectedSkill: Skill | null = null;
  public showClickPrompt = true;

  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private controls!: OrbitControls;
  private animationId!: number;
  private promptTimeout!: any;
  private resizeDebounceTimeout!: any;
  private wasMobile = window.innerWidth < 768;

  constructor(private ngZone: NgZone) {}

  ngAfterViewInit(): void {
    this.initGalaxy();
    this.animate();
    this.promptTimeout = setTimeout(() => this.showClickPrompt = false, 5000);
  }

  ngOnDestroy(): void {
    cancelAnimationFrame(this.animationId);
    clearTimeout(this.promptTimeout);
    clearTimeout(this.resizeDebounceTimeout);
    window.removeEventListener('resize', this.onWindowResize.bind(this));
    if (this.renderer) {
      this.renderer.dispose();
    }
  }

  private initGalaxy(): void {
    // 1. Configuración inicial de la escena
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x000814);

    // 2. Configuración de cámara responsive
    const canvas = this.galaxyCanvas.nativeElement;
    this.camera = new THREE.PerspectiveCamera(
      this.wasMobile ? 55 : 45,
      canvas.clientWidth / canvas.clientHeight,
      0.1,
      1000
    );
    
    // 3. Renderer optimizado
    this.renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      antialias: true,
      powerPreference: "high-performance"
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(canvas.clientWidth, canvas.clientHeight);

    // 4. Configuración de iluminación
    const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 5, 5);
    this.scene.add(directionalLight);

    // 5. Creación de elementos
    this.createStars();
    this.distributePlanets();
    this.setupControls();

    // 6. Configuración de interactividad
    this.addInteractivity();
    window.addEventListener('resize', this.onWindowResize.bind(this));
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

  private distributePlanets(): void {
    const isMobile = window.innerWidth < 768;
    const baseRadius = isMobile ? 5 : 8;
    const count = this.skills.length;
    const goldenRatio = (1 + Math.sqrt(5)) / 2;
    
    this.skills.forEach((skill, index) => {
      // Distribución en espiral Fibonacci
      const theta = 2 * Math.PI * index / goldenRatio;
      const phi = Math.acos(1 - 2 * (index + 0.5) / count);
      
      skill.x = baseRadius * Math.cos(theta) * Math.sin(phi);
      skill.y = baseRadius * Math.sin(theta) * Math.sin(phi);
      skill.z = baseRadius * Math.cos(phi);

      // Creación del planeta
      const geometry = new THREE.SphereGeometry(skill.size, 32, 32);
      const material = new THREE.MeshPhongMaterial({
        color: new THREE.Color(skill.color),
        shininess: 100,
        emissive: new THREE.Color(skill.color).clone().multiplyScalar(0.2)
      });

      const planet = new THREE.Mesh(geometry, material);
      planet.position.set(skill.x, skill.y, skill.z);
      planet.userData = skill;
      
      // Añadir anillo a tecnologías principales
      if (['Angular', 'React', 'TypeScript'].includes(skill.name)) {
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

      this.scene.add(planet);
    });

    // Posición inicial de cámara responsive
    this.camera.position.z = baseRadius * (isMobile ? 3 : 2.5);
    this.camera.fov = isMobile ? 55 : 45;
    this.camera.updateProjectionMatrix();
  }

  private setupControls(): void {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.rotateSpeed = 0.5;
    this.controls.zoomSpeed = 0.8;
    
    // Límites de zoom responsive
    const isMobile = window.innerWidth < 768;
    this.controls.minDistance = isMobile ? 8 : 10;
    this.controls.maxDistance = isMobile ? 20 : 30;
    
    // Auto-rotación inicial
    this.controls.autoRotate = true;
    this.controls.autoRotateSpeed = 0.5;
    
    // Manejo mejorado del scroll
    this.controls.addEventListener('change', () => {
      if (this.controls.getDistance() < (this.wasMobile ? 12 : 15)) {
        this.galaxyCanvas.nativeElement.style.pointerEvents = 'none';
      } else {
        this.galaxyCanvas.nativeElement.style.pointerEvents = 'auto';
      }
    });
  }

  private addInteractivity(): void {
    const raycaster = new THREE.Raycaster();
    raycaster.params.Points.threshold = 0.2; // Aumentar sensibilidad para objetos pequeños
    const pointer = new THREE.Vector2();

    const handleInteraction = (event: MouseEvent | TouchEvent) => {
      // Obtener coordenadas normalizadas
      const getCoordinates = (clientX: number, clientY: number) => {
        pointer.x = (clientX / this.galaxyCanvas.nativeElement.clientWidth) * 2 - 1;
        pointer.y = - (clientY / this.galaxyCanvas.nativeElement.clientHeight) * 2 + 1;
      };

      if (event instanceof TouchEvent) {
        event.preventDefault(); // Prevenir scroll accidental
        const touch = event.touches[0] || event.changedTouches[0];
        getCoordinates(touch.clientX, touch.clientY);
      } else {
        getCoordinates(event.clientX, event.clientY);
      }

      raycaster.setFromCamera(pointer, this.camera);
      
      // Incluir todos los objetos en la detección
      const allObjects: THREE.Object3D[] = [];
      this.scene.traverse(obj => allObjects.push(obj));
      
      const intersects = raycaster.intersectObjects(allObjects, true);

      this.ngZone.run(() => {
        if (intersects.length > 0) {
          // Buscar el objeto padre que tiene userData (el planeta)
          let clickedObj: THREE.Object3D | null = intersects[0].object;
          
          while (clickedObj !== null && !(clickedObj.userData && clickedObj.userData['name'])) {
            clickedObj = clickedObj.parent;
          }
      
          if (clickedObj !== null && clickedObj.userData && clickedObj.userData['name']) {
            this.selectedSkill = {
              name: clickedObj.userData['name'] as string,
              icon: clickedObj.userData['icon'] as string,
              size: clickedObj.userData['size'] as number,
              color: clickedObj.userData['color'] as string,
              x: clickedObj.userData['x'] as number,
              y: clickedObj.userData['y'] as number,
              z: clickedObj.userData['z'] as number,
              experience: clickedObj.userData['experience'] as string
            };
            this.showClickPrompt = false;
            return;
          }
        }
        this.selectedSkill = null;
      });
    };

    // Agregar eventos con passive: false para mejor control en móviles
    this.galaxyCanvas.nativeElement.addEventListener('click', handleInteraction);
    this.galaxyCanvas.nativeElement.addEventListener('touchstart', handleInteraction, { passive: false });
  }

  private onWindowResize(): void {
    // Debounce para evitar múltiples recálculos
    clearTimeout(this.resizeDebounceTimeout);
    this.resizeDebounceTimeout = setTimeout(() => {
      const canvas = this.galaxyCanvas.nativeElement;
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      
      // Actualizar cámara
      this.camera.aspect = width / height;
      
      // Redistribuir planetas si cambió de móvil a desktop o viceversa
      const currentIsMobile = width < 768;
      if (this.wasMobile !== currentIsMobile) {
        this.distributePlanets();
        this.wasMobile = currentIsMobile;
      }
      
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(width, height);
    }, 100);
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