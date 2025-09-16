import { Component } from '@angular/core';
import { QuestionService } from '../data-access/question.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-chat-window',
  imports: [FormsModule, CommonModule],
  templateUrl: './chat-window.component.html',
  styleUrl: './chat-window.component.css'
})
export class ChatWindowComponent {
  newMessage: string = '';
  meVariable = 'myself';
  messagesList: any = [
    {
      sender: "bot",
      text: "¡Bienvenido! Es un gusto poder atenderte. ¿Cómo puedo ayudarte?"
    }
  ]
  respuesta = '';
  isSending = false;

  constructor(private questionService: QuestionService) { }

  sendMessage() {
    console.log(this.newMessage);
    const trimmed = this.newMessage?.trim();
    console.log(trimmed);
    if (!trimmed) return;

    let message = {
      sender: 'myself',
      text: trimmed
    }
    this.messagesList.push(message)
    this.newMessage = '';
    setTimeout(() => {
      this.autoScrollToLastMessageByClassName()
    }, 15);

    this.isSending = true;

    this.processMessage(trimmed)



  }

  autoScrollToLastMessageByClassName() {
    let elements = document.getElementsByClassName('msj');
    let lastMsj: any = elements[elements.length - 1];
    let topPosition = lastMsj.offsetTop;

    const container = document.getElementById('messageContainer');
    if (container) {
      container.scrollTop = topPosition;
    }
  }

  processMessage(msj: string) {
    this.questionService.sendQuestion(msj).subscribe({
      next: (res) => {
        let message = {
          sender: 'bot',
          text: res.answer
        }
        this.messagesList.push(message);
        this.isSending = false;
        this.newMessage = '';
      },
      error: (err) => {
        let message = {
          sender: 'bot',
          text: '¡Ups! Hubo un error al procesar tu pregunta'
        }
        this.messagesList.push(message);
        this.isSending = false;
        this.newMessage = '';
        setTimeout(() => {
          this.autoScrollToLastMessageByClassName()
        }, 15);
      },
    });
  }

  // ngOnInit() {
  //   this.consultar()

  // }
}
