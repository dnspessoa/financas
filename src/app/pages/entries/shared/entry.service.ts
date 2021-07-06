import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Observable, throwError } from 'rxjs';
import { map, catchError, flatMap, mergeMap,  } from 'rxjs/operators';

import { CategoryService } from '../../categories/shared/category.service';
import { Entry } from './entry.model';

@Injectable({
  providedIn: 'root'
})

export class EntryService {

  //prop class
  private apiPath: string = 'api/entries';

  constructor(
    private http: HttpClient,
    private categoryService : CategoryService
    ) { }

  //região inicio metodos
  getAll(): Observable<Entry[]> {
    return this.http.get(this.apiPath).pipe(
      catchError(this.handleError),
      map(this.jsonDataToEntries)
    );
  }

  getById(id: number): Observable<Entry> {
    const url = `${this.apiPath}/${id}`;

    return this.http.get(url).pipe(
      catchError(this.handleError),
      map(this.jsonDataToEntry)
    );
  }

  create(entry: Entry): Observable<Entry> {

    return this.categoryService.getById(entry.categoryId).pipe(
      mergeMap(category => {
        entry.category = category

        return this.http.post(this.apiPath, entry).pipe(
          catchError(this.handleError),
          map(this.jsonDataToEntry)
        );
      })
    )
  }

  update(entry: Entry): Observable<Entry> {
    const url = `${this.apiPath}/${entry.id}`;

    return this.categoryService.getById(entry.categoryId).pipe(
      mergeMap(category => {
        entry.category = category

        return this.http.put(url, entry).pipe(
          catchError(this.handleError),
          map(() => entry)
        );
      })
    )
  }

  delete(id: number): Observable<any> {
    const url = `${this.apiPath}/${id}`;

    return this.http.delete(url).pipe(
      catchError(this.handleError),
      map(() => null)
    );
  }
  
  //região fim metodos

  //região inicio metodos privates
  private jsonDataToEntries(jsonData: any[]): Entry[] {

    //console.log(jsonData[0] as Entry); //montra um obj generico
    //console.log( Object.assign(new Entry(), jsonData[0])); //mostra um obj assinado do tipo entry

    const entries: Entry[] = [];
    jsonData.forEach(element => {
      const entry = Object.assign(new Entry, element);
      entries.push(entry);
    });
    return entries;
  }

  private jsonDataToEntry(jsonData: any): Entry {
    return Object.assign(new Entry, jsonData);
  }

  private handleError(error: any): Observable<any> {
    console.log('Erro na requisição => ', error);
    return throwError(error);
  }
  //região fim metodos privates

}
