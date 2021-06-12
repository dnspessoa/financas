import { AfterContentChecked, Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Route, Router } from '@angular/router';

import { Entry } from '../shared/entry.model';
import { EntryService } from '../shared/entry.service';

import { switchMap } from 'rxjs/operators';

//import toastr from 'ngx-toastr'

@Component({
  selector: 'app-entry-form',
  templateUrl: './entry-form.component.html',
  styleUrls: ['./entry-form.component.css']
})
export class EntryFormComponent implements OnInit, AfterContentChecked {

  //prop class

   _currentAction: string;
   _entryForm: FormGroup;
   _pageTitle: string;
   _serverErrorMessages: string[] = [];
   _submittingForm: boolean = false;
   _entry: Entry = new Entry;

  constructor(
    private entryService: EntryService,
    private route: ActivatedRoute,
    private router: Router,
    private formBuilder: FormBuilder
  ) { }

  ngAfterContentChecked(): void {
    this.setPageTitle();
  }

  setPageTitle() {
    if (this._currentAction === 'new') {
      this._pageTitle = 'Cadastro de nova Lançamento';
    }
    else {
      const entryName = this._entry.name || '';
      this._pageTitle = 'Editando Lançamento: ' + entryName;
    }
  }

  ngOnInit(): void {
    this.setCurrentAction();
    this.buildEntryForm();
    this.loadEntry();
  }

  setCurrentAction() {
    if (this.route.snapshot.url[0].path == 'new') {
      this._currentAction = 'new';
    }
    else {
      this._currentAction = 'edit';
    }
  }

  buildEntryForm() {
    this._entryForm = this.formBuilder.group({
      id: [null],
      name: [null, [Validators.required, Validators.maxLength(2)]],
      description: [null],
      type: [null, [Validators.required]],
      amount: [null, [Validators.required]],
      date: [null, [Validators.required]],
      paid: [null, [Validators.required]],
      categoryId: [null, [Validators.required]]
    });
  }

  loadEntry() {
    if (this._currentAction === 'edit') {

      this.route.paramMap.pipe(
        switchMap(params => this.entryService.getById(+params.get('id')))
      ).subscribe(
        (entry) => {
          this._entry = entry;
          this._entryForm.patchValue(entry); // binds loaded entry data to EntryForms
        },
        (error) => alert('Ocorreu um erro no servidor, tente mais tarde.')
      );
    }
  }

  submitForm() {
    this._submittingForm = true;

    if(this._currentAction == 'new') {
      this.createEntry();
    }
    else {
      this.updateEntry();
    }
  }

  createEntry() {
    const entry: Entry = Object.assign(new Entry(), this._entryForm.value);

    this.entryService.create(entry)
      .subscribe(
        entry => this.actionsForSucess(entry),
        error =>  this.actionForError(error)
      );
  }

  actionsForSucess(entry: Entry) {
    //toastr falta implementar
    alert('Solicitação processada com sucesso');

    // recarrega formulario para o metodo de edição
    // url atual: nomesitel.com/entries/new
    // skipLocationChange: não armazena no historico do navegador
    // redirect/reload component page
    this.router.navigateByUrl('entries', {skipLocationChange: true}).then(
      () => this.router.navigate(['entries', entry.id, 'edit'])
    );
  }

  actionForError(error: any): void {
    //this.toastr.error('Ocorreu um erro ao processar a sua solicitação');
    alert('Ocorreu um erro ao processar a sua solicitação');

    this._submittingForm = false;

    if (error.status === 422) {
      this._serverErrorMessages = JSON.parse(error._body).errors;
    }
    else{
      this._serverErrorMessages = ['Falha na comunicação com o servidoor. Por favor, tente mais tarde.']
    }
  }

  updateEntry() {
    const entry: Entry = Object.assign(new Entry(), this._entryForm.value);

    this.entryService.update(entry)
      .subscribe(
        entry => this.actionsForSucess(entry),
        error =>  this.actionForError(error)
      );
  }

}
