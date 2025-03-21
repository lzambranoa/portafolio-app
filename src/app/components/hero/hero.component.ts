import { Component } from '@angular/core';

@Component({
  selector: 'app-hero',
  templateUrl: './hero.component.html',
  styleUrls: ['./hero.component.scss']
})
export class HeroComponent {

downloadPdf() {
  const link = document.createElement('a');
  link.setAttribute('target', '_blank');
  link.setAttribute('href', '../../../assets/documents/CV - Leonardo Zambrano Amezquita.pdf');
  link.setAttribute('download', `CV.pdf`);
  document.body.appendChild(link);
  link.click();
  link.remove
  }
}
