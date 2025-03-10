import { Component } from '@angular/core';

@Component({
  selector: 'app-skills',
  templateUrl: './skills.component.html',
  styleUrls: ['./skills.component.scss']
})
export class SkillsComponent {

  images: string[] = [
    "../../../assets/img/icons/html5.svg",
    "../../../assets/img/icons/css3.svg",
    "../../../assets/img/icons/sass.svg",
    "../../../assets/img/icons/angular.svg",
    "../../../assets/img/icons/react.svg",
    "../../../assets/img/icons/github.svg"
  ]
}
