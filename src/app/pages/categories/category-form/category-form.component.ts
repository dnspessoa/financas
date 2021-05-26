import { AfterContentChecked, Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Route, Router } from '@angular/router';

import { Category } from '../shared/category.model';
import { CategoryService } from '../shared/category.service';

import { switchMap } from 'rxjs/operators';

//import toastr from 'ngx-toastr'

@Component({
  selector: 'app-category-form',
  templateUrl: './category-form.component.html',
  styleUrls: ['./category-form.component.css']
})
export class CategoryFormComponent implements OnInit, AfterContentChecked {

  //prop class

   _currentAction: string;
   _categoryForm: FormGroup;
   _pageTitle: string;
   _serverErrorMessages: string;
   _submittingForm: boolean = false;
   _category: Category = new Category;

  constructor(
    private categoryService: CategoryService,
    private route: ActivatedRoute,
    private router: Router,
    private formBuilder: FormBuilder
  ) { }

  ngAfterContentChecked(): void {
    this.setPageTitle();
  }

  setPageTitle() {
    if (this._currentAction === 'new') {
      this._pageTitle = 'Cadastro de nova Categoria';
    }
    else {
      const categoryName = this._category.name || '';
      this._pageTitle = 'Editando Categoria: ' + categoryName;
    }
  }

  ngOnInit(): void {
    this.setCurrentAction();
    this.buildCategoryForm();
    this.loadCategory();
  }

  setCurrentAction() {
    if (this.route.snapshot.url[0].path == 'new') {
      this._currentAction = 'new';
    }
    else {
      this._currentAction = 'edit';
    }

  }

  buildCategoryForm() {
    this._categoryForm = this.formBuilder.group({
      id: [null],
      name: [null, [Validators.required, Validators.maxLength(2)]],
      description: [null]
    });
  }

  loadCategory() {
    if (this._currentAction === 'edit') {

      this.route.paramMap.pipe(
        switchMap(params => this.categoryService.getById(+params.get('id')))
      ).subscribe(
        (category) => {
          this._category = category;
          this._categoryForm.patchValue(category); // binds loaded category data to CategoryForms
        },
        (error) => alert('Ocorreu um erro no servidor, tente mais tarde.')
      );
    }
  }

}
