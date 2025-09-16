import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ChatWindowComponent } from "./chat-window/chat-window.component";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ChatWindowComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'chatbot-frontend';

  check() {
    const smlrt = "cuales formas de envio tienen que formas de envio ofrecen"
    console.log(smlrt);

  }

  ngOnInit() {
    this.check();
  }


}
