import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Skill } from 'src/app/interfaces/skills.interface';

@Component({
  selector: 'app-skills-cards',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './skills-cards.component.html',
  styleUrls: ['./skills-cards.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})

export class SkillsCardsComponent { 
  skills: (Skill & { flipped?: boolean })[] = [
    { name: 'HTML', level: 'Avanzado', icon: 'assets/img/icons/html5.svg', experience: '3+ años, 10 proyectos', flipped: false },
    { name: 'CSS', level: 'Avanzado', icon: 'assets/img/icons/css3.svg', experience: '3+ años, 10 proyectos', flipped: false },
    { name: 'Angular', level: 'Intermedio', icon: 'assets/img/icons/angular.svg', experience: '2 años, 5 proyectos', flipped: false },
    { name: 'React', level: 'Intermedio', icon: 'assets/img/icons/react.svg', experience: '1.5 años, 4 proyectos', flipped: false },
    { name: 'Sass', level: 'Intermedio', icon: 'assets/img/icons/sass.svg', experience: '1 año, 3 proyectos', flipped: false },
    { name: 'NPM', level: 'Avanzado', icon: 'assets/img/icons/npm.svg', experience: 'Uso diario en todos los proyectos', flipped: false },
  ];


   toggleFlip(skill: Skill & { flipped?: boolean }, event?: Event) {
    // Detecta si el dispositivo soporta hover (desktop con mouse)
    const hoverSupported =
      typeof window !== 'undefined' &&
      window.matchMedia('(hover: hover) and (pointer: fine)').matches;

    // Si el dispositivo soporta hover y el evento es un click del mouse,
    // ignoramos el click para preservar hover en desktop.
    if (hoverSupported && event && event.type === 'click') {
      return;
    }

    // Si viene de un teclado, prevenimos el comportamiento por defecto (ej. espacio scroll)
    if (event && (event.type === 'keydown' || event.type === 'keypress')) {
      event.preventDefault();
    }

    skill.flipped = !skill.flipped;
  }
}

