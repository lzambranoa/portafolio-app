import emailjs, { EmailJSResponseStatus } from '@emailjs/browser';
import { Component } from '@angular/core';
import { environment } from 'src/environments/environments';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss']
})
export class ContactComponent {
message: string = '';

private service_id = environment.SERVICE_ID;
private template_id = environment.TEMPLATE_ID;
private public_key = environment.PUBLIC_KEY;


  public sendEmail(e: Event) {
    e.preventDefault();
    
    emailjs
      .sendForm(`${this.service_id}`, `${this.template_id}`, e.target as HTMLFormElement, {
       publicKey: `${this.public_key}`
      })
      .then(
        () => {
        console.log('Correo enviado con éxito:');
      })
      .catch((error) => {
        console.error('Error al enviar el correo:', (error as EmailJSResponseStatus).text);
      });
  }
}
