import { animate, style, transition, trigger } from '@angular/animations';
import { Component, ElementRef, ViewChild, AfterViewInit, NgZone, OnDestroy, HostListener } from '@angular/core';
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
    trigger('pulse', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px) scale(0.9)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0) scale(1)' }))
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ opacity: 0, transform: 'translateY(20px) scale(0.9)' }))
      ])
    ]),
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
export class SkillGalaxyComponent implements AfterViewInit, OnDestroy {
  @ViewChild('galaxyCanvas', { static: true }) 
  private galaxyCanvas!: ElementRef<HTMLCanvasElement>;

  public skills: Skill[] = [
    { name: 'Angular', icon: '../../../assets/img/icons/angular.svg', size: 1.2, color: '#DD0031', x: 0, y: 0, z: 0, experience: '2+ años' },
    { name: 'React', icon: '../../../assets/img/icons/react.svg', size: 1.0, color: '#61DAFB', x: 0, y: 0, z: 0, experience: '1+ año' },
    { name: 'Sass', icon: '../../../assets/img/icons/sass.svg', size: 0.9, color: '#CC6699', x: 0, y: 0, z: 0, experience: '2+ años' },
    { name: 'HTML5', icon: '../../../assets/img/icons/html5.svg', size: 1.0, color: '#E34F26', x: 0, y: 0, z: 0, experience: '3+ años' },
    { name: 'CSS3', icon: '../../../assets/img/icons/css3.svg', size: 0.9, color: '#1572B6', x: 0, y: 0, z: 0, experience: '3+ años' },
    { name: 'Github', icon: '../../../assets/img/icons/github.svg', size: 0.9, color: '#F05032', x: 0, y: 0, z: 0, experience: '2+ años' },
  ];

  public selectedSkill: Skill | null = null;
  public hoveredSkill: Skill | null = null;
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

  // Método para cerrar el tooltip
  public closeTooltip(): void {
    this.selectedSkill = null;
  }

  // Cerrar tooltip al presionar Escape
  @HostListener('document:keydown.escape', ['$event'])
  handleEscapeKey(event: KeyboardEvent) {
    this.closeTooltip();
  }

  private initGalaxy(): void {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x000814);

    const canvas = this.galaxyCanvas.nativeElement;
    this.camera = new THREE.PerspectiveCamera(
      this.wasMobile ? 55 : 45,
      canvas.clientWidth / canvas.clientHeight,
      0.1,
      1000
    );
    
    this.renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      antialias: true,
      powerPreference: "high-performance"
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(canvas.clientWidth, canvas.clientHeight);

    const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 5, 5);
    this.scene.add(directionalLight);

    this.createStars();
    this.distributePlanets();
    this.setupControls();
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
      const theta = 2 * Math.PI * index / goldenRatio;
      const phi = Math.acos(1 - 2 * (index + 0.5) / count);
      
      skill.x = baseRadius * Math.cos(theta) * Math.sin(phi);
      skill.y = baseRadius * Math.sin(theta) * Math.sin(phi);
      skill.z = baseRadius * Math.cos(phi);

      const geometry = new THREE.SphereGeometry(skill.size, 32, 32);
      const material = new THREE.MeshPhongMaterial({
        color: new THREE.Color(skill.color),
        shininess: 100,
        emissive: new THREE.Color(skill.color).clone().multiplyScalar(0.2)
      });

      const planet = new THREE.Mesh(geometry, material);
      planet.position.set(skill.x, skill.y, skill.z);
      planet.userData = skill;
      
      const ringGeometry = new THREE.RingGeometry(skill.size * 1.3, skill.size * 1.5, 32);
      const ringMaterial = new THREE.MeshBasicMaterial({
        color: new THREE.Color(skill.color),
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0,
        visible: false
      });
      const ring = new THREE.Mesh(ringGeometry, ringMaterial);
      ring.rotation.x = Math.PI / 2;
      ring.name = 'selectionRing';
      planet.add(ring);

      this.scene.add(planet);
    });

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
    
    const isMobile = window.innerWidth < 768;
    this.controls.minDistance = isMobile ? 8 : 10;
    this.controls.maxDistance = isMobile ? 20 : 30;
    
    this.controls.autoRotate = true;
    this.controls.autoRotateSpeed = 0.5;
    
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
    raycaster.params.Line!.threshold = 0.1;
    raycaster.params.Points!.threshold = 0.1;
    const pointer = new THREE.Vector2();

    const updatePointer = (clientX: number, clientY: number) => {
      const rect = this.galaxyCanvas.nativeElement.getBoundingClientRect();
      pointer.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((clientY - rect.top) / rect.height) * 2 + 1;
    };

    const handleClick = (event: MouseEvent | TouchEvent) => {
      event.preventDefault();
      
      if (event instanceof TouchEvent) {
        const touch = event.touches[0] || event.changedTouches[0];
        updatePointer(touch.clientX, touch.clientY);
      } else {
        updatePointer(event.clientX, event.clientY);
      }

      raycaster.setFromCamera(pointer, this.camera);
      
      const intersects = raycaster.intersectObjects(this.scene.children, true);
      
      this.ngZone.run(() => {
        if (intersects.length > 0) {
          let clickedObj = intersects[0].object;
          
          while (clickedObj && !clickedObj.userData?.['name']) {
            if (clickedObj.parent) {
              clickedObj = clickedObj.parent;
            } else {
              break;
            }
          }

          if (clickedObj?.userData?.['name']) {
            this.selectedSkill = clickedObj.userData as Skill;
            this.showClickPrompt = false;
            return;
          }
        }
      });
    };

    const handleHover = (event: MouseEvent) => {
      updatePointer(event.clientX, event.clientY);
      raycaster.setFromCamera(pointer, this.camera);
      
      const intersects = raycaster.intersectObjects(this.scene.children, true);
      
      this.ngZone.run(() => {
        if (intersects.length > 0) {
          let hoveredObj = intersects[0].object;
          
          while (hoveredObj && !hoveredObj.userData?.['name']) {
            if (hoveredObj.parent) {
              hoveredObj = hoveredObj.parent;
            } else {
              break;
            }
          }

          if (hoveredObj?.userData?.['name']) {
            this.hoveredSkill = hoveredObj.userData as Skill;
            this.galaxyCanvas.nativeElement.style.cursor = 'pointer';
            return;
          }
        }
        
        this.hoveredSkill = null;
        this.galaxyCanvas.nativeElement.style.cursor = 'grab';
      });
    };

    this.galaxyCanvas.nativeElement.addEventListener('click', handleClick);
    this.galaxyCanvas.nativeElement.addEventListener('touchstart', handleClick, { passive: false });
    this.galaxyCanvas.nativeElement.addEventListener('mousemove', handleHover);
  }

  private updateSelectionRings(): void {
    this.scene.traverse(obj => {
      if (obj.name === 'selectionRing') {
        const ring = obj as THREE.Mesh;
        const material = ring.material as THREE.MeshBasicMaterial;
        
        if (this.hoveredSkill && ring.parent?.userData?.['name'] === this.hoveredSkill.name) {
          material.visible = true;
          material.opacity = 0.6;
        } else if (this.selectedSkill && ring.parent?.userData?.['name'] === this.selectedSkill.name) {
          material.visible = true;
          material.opacity = 0.8;
        } else {
          material.visible = false;
          material.opacity = 0;
        }
      }
    });
  }

  private onWindowResize(): void {
    clearTimeout(this.resizeDebounceTimeout);
    this.resizeDebounceTimeout = setTimeout(() => {
      const canvas = this.galaxyCanvas.nativeElement;
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      
      this.camera.aspect = width / height;
      
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
        this.updateSelectionRings();
        this.renderer.render(this.scene, this.camera);
      };
      animationLoop();
    });
  }
}