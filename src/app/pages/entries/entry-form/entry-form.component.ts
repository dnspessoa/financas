import { AfterContentChecked, Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Route, Router } from '@angular/router';

import { Entry } from '../shared/entry.model';
import { EntryService } from '../shared/entry.service';

import { switchMap } from 'rxjs/operators';

import { Category } from '../../categories/shared/category.model';
import { CategoryService } from '../../categories/shared/category.service';

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
  _categories: Array<Category>;

  _imaskConfig = {
    mask: Number,
    scale: 2,
    thousandsSeparator: '',
    padFractionalZeros: true,
    normalizeZeros: true,
    radix: ','
  };

  ptBR = {
    firstDayOfWeek: 0,
    dayNames: ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'],
    dayNamesShort: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'],
    dayNamesMin: ['Do', 'Se', 'Te', 'Qu', 'Qu', 'Se', 'Sa'],
    monthNames: [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho',
      'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ],
    monthNamesShort: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
    today: 'Hoje',
    clear: 'Limpar'
  };

  constructor(
    private entryService: EntryService,
    private route: ActivatedRoute,
    private router: Router,
    private formBuilder: FormBuilder,
    private categoryService: CategoryService
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
    this.loadCategories();
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
      type: ["expense", [Validators.required]],
      amount: [null, [Validators.required]],
      date: [null, [Validators.required]],
      paid: [true, [Validators.required]],
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

  private loadCategories() {
    this.categoryService.getAll().subscribe(
      categories => this._categories = categories
    );
  }

  submitForm() {
    this._submittingForm = true;

    if (this._currentAction == 'new') {
      this.createEntry();
    }
    else {
      this.updateEntry();
    }
  }

  get typeOptions(): Array<any> {
    return Object.entries(Entry.types).map(
      ([value, text]) => {
        return {
          text: text,
          value: value
        }
      }
    )
  }

  createEntry() {
    const entry: Entry = Object.assign(new Entry(), this._entryForm.value);

    this.entryService.create(entry)
      .subscribe(
        entry => this.actionsForSucess(entry),
        error => this.actionForError(error)
      );
  }

  actionsForSucess(entry: Entry) {
    //toastr falta implementar
    alert('Solicitação processada com sucesso');

    // recarrega formulario para o metodo de edição
    // url atual: nomesitel.com/entries/new
    // skipLocationChange: não armazena no historico do navegador
    // redirect/reload component page
    this.router.navigateByUrl('entries', { skipLocationChange: true }).then(
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
    else {
      this._serverErrorMessages = ['Falha na comunicação com o servidoor. Por favor, tente mais tarde.']
    }
  }

  updateEntry() {
    const entry: Entry = Object.assign(new Entry(), this._entryForm.value);

    this.entryService.update(entry)
      .subscribe(
        entry => this.actionsForSucess(entry),
        error => this.actionForError(error)
      );
  }

}
