import { Component, OnInit } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'portafolio-app';

  constructor(private titleService: Title, private metaService: Meta) {}

  ngOnInit(): void {
    this.titleService.setTitle('Leonardo Zambrano | Desarrollador Web FullStack');
    this.metaService.addTags([
      { name: 'description', content: 'Portafolio de Leonardo Zambrano, Desarrollador Web FullStack especializado en crear experiencias web modernas y funcionales.' },
      { name: 'keywords', content: 'Leonardo Zambrano, Desarrollador Web, FullStack, Portfolio, Web Design, Angular, Developer' },
      { name: 'author', content: 'Leonardo Zambrano' },
      { name: 'robots', content: 'index, follow' }
    ]);
  }
}
