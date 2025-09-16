import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { IAnswerResponse } from '../Interfaces/IAnswerResponse';
import { IQuestion } from '../Interfaces/IQuestion';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class QuestionService {
  private apiUrl = 'http://localhost:3000/api/process-response';

  constructor(private http: HttpClient) { }

  sendQuestion(question: string): Observable<IAnswerResponse> {
    console.log(question);
    const payload: IQuestion = { question };
    console.log("payload", payload);
    return this.http.post<IAnswerResponse>(this.apiUrl, payload);
  }
}
