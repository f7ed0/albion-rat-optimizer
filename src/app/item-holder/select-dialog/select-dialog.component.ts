import { Component, Inject, OnChanges, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { AsyncPipe, CommonModule } from '@angular/common';
import { MatAutocompleteModule, MatOption } from '@angular/material/autocomplete';
import { RequestService } from '../../_services/request-service.service';
import { MatSelectModule } from '@angular/material/select';
import {MatButtonModule} from '@angular/material/button'

@Component({
  selector: 'app-select-dialog',
  standalone: true,
  imports: [
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule,
    ReactiveFormsModule,
    AsyncPipe,
    MatSelectModule,
    MatButtonModule,
  ],
  templateUrl: './select-dialog.component.html',
  styleUrl: './select-dialog.component.scss'
})
export class SelectDialogComponent implements OnInit,OnChanges {
  public filteredOptions: any[] = []
  public options: any[] = []
  public tier:number = 0
  public search_value:string = ""
  public quality:{level : number, title : string}[] = [
    {level : 1, title : "Normal"},
    {level : 2, title : "Good"},
    {level : 3, title : "Outstanding"},
    {level : 4, title : "Excellent"},
    {level : 5, title : "Masterpiece"},
  ]
  public tiercolor:{[iter:number]:string} = {
    2 : "#776355",
    3 : "#4C623C",
    4 : "#325E79",
    5 : "#952A21",
    6 : "#C9783B",
    7 : "#D3B759",
    8 : "#EBEBEB",
  }

  constructor(
    public dialogRef: MatDialogRef<SelectDialogComponent>,
    public api: RequestService,
    @Inject(MAT_DIALOG_DATA) public data: { itemID: string, enchantLevel: number, itemLevel: number, quality: number, slot: "offhand" | "cape" | "shoes" | "head" | "armor" | "mainhand" | "mount" | "food" | "potion" | "bag" },
  ) {
  }

  async ngOnInit() {
    this.options = this.api.GetItemForSlot(this.data.slot)
    this.options.sort((a:any,b:any) => {return a["@uniquename"] < b["@uniquename"] ? -1 : 1})
    this._filter()
  }

  async ngOnChanges() {
    this._filter()
  }


  public _filter() {
    console.log("FILTER")
    this.filteredOptions = this.options.filter(option => 
      (this.tier === 0 ? true : option['@uniquename'].includes(`T${this.tier}_`) )
      &&
      (this.api.getLocalised(option['@uniquename'],"EN-US"))
      &&
      (this.api.getLocalised(option['@uniquename'],"EN-US")?.toLowerCase().includes(this.search_value.toLowerCase()))
    );

  }

  public item_url(uniquename:string) {
    if(this.data.itemID){
      return `https://render.albiononline.com/v1/item/${uniquename}@${this.data.enchantLevel}.png?quality=${this.data.quality}`
    }
    return ""
  }

  act() {
    this.data.itemID = ""
  }

  public saveAndQuit() {
    this.data.itemLevel = Number.parseInt(this.data.itemID[1])
    this.dialogRef.close(this.data)
  }

  public abortAndQuit() {
    this.dialogRef.close(null)
  }

  public updateSearch(value:string) {
    console.log(value)
    this.search_value = value
    this._filter()
  }
}
