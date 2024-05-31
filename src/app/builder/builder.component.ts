import { Component,Inject,OnInit } from '@angular/core';
import { ActivatedRoute, RouterOutlet } from '@angular/router';
import {ItemHolderComponent} from '../item-holder/item-holder.component';
import {RequestService} from '../_services/request-service.service';
import * as j2c from 'json-2-csv';
import { ItemData } from '../ItemData.class';
import {encode,decode} from 'js-base64';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { DOCUMENT } from '@angular/common';
import {ClipboardModule} from '@angular/cdk/clipboard';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar'
import { PriceFormatter } from '../_services/priceformatter.service';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDialog } from '@angular/material/dialog';
import { ManualOptimizerComponent } from '../manual-optimizer/manual-optimizer.component';

@Component({
  selector: 'builder-root',
  standalone: true,
  imports: [
    RouterOutlet,ItemHolderComponent,MatButtonModule,MatIconModule,
    ClipboardModule,MatSnackBarModule,MatInputModule,MatSelectModule
  ],
  templateUrl: './builder.component.html',
  styleUrl: './builder.component.scss'
})
export class BuilderComponent implements OnInit {
  public o_k:Function = Object.keys
  public current_city = "Brecilien"
  public slottypes:string[] = ["cape","head","armor","mainhand","offhand","shoes","bag","mount","food","potion"]
  public items_data:{[id:string]:ItemData} = {
    "offhand" : new ItemData(),
    "cape" : new ItemData(),
    "shoes" : new ItemData(),
    "head" : new ItemData(),
    "armor" : new ItemData(),
    "mainhand" : new ItemData(),
    "mount" : new ItemData(),
    "food" : new ItemData(),
    "potion" : new ItemData(),
    "bag"  : new ItemData(),
  }

  constructor(
    public api:RequestService,
    private AR:ActivatedRoute,
    private snackbar:MatSnackBar,
    public pf:PriceFormatter,
    private dialog:MatDialog,
    @Inject(DOCUMENT) private document:Document
  ){}

  item_list:any = {}

  async ngOnInit() {
    await this.api.checkAndDl();
    let build:string|null = this.AR.snapshot.paramMap.get("build")
    if(build) {
      let arr:any[] = j2c.csv2json(decode(build))
      for(let item of arr) {
        this.items_data[item.s] = new ItemData(item.i, item.l, item.e, item.q, item.qt)
        this.items_data[item.s].price = (await this.api.getPrice(item.i,item.e,item.q,this.current_city))
        this.items_data[item.s].IP = this.api.getItemPower(item.i,item.e,item.q)
      }
    }
  }

  public openCopySnack() {
    this.snackbar.open("Url copied to you cliboard","Nice cock")
  }

  public get URL() {
    let tocsv:object[] = []
    for(let slot in this.items_data){
      tocsv.push(Object.assign({
        i :this.items_data[slot].itemID,
        l : this.items_data[slot].itemLevel,
        e : this.items_data[slot].enchantLevel,
        q : this.items_data[slot].quality,
        qt : this.items_data[slot].quantity,
        s : slot
      }))
    }
    //console.log(j2c.json2csv(tocsv))
    return this.document.location.host+"/"+encode(j2c.json2csv(tocsv));
  }

  public get IPTotalStuff():number {
    let sum = 0
    for(let slot of this.slottypes.slice(0,6)) {
      sum += this.items_data[slot].IP
    }
    return Math.floor(sum/6)
  }

  public get PriceTotalStuff():number {
    let sum = 0
    for(let slot of this.slottypes.slice(0,6)) {
      if(this.items_data[slot].price){
        if(slot === "offhand" && this.isWeaponTwoHanded()) {
          continue
        }
        sum += this.items_data[slot].price
      }
      
    }
    return sum
  }

  public get PriceTotalTransport():number {
    let sum = 0
    for(let slot of this.slottypes.slice(6,8)) {
      if(this.items_data[slot].price) {
        sum += this.items_data[slot].price
      }
      
    }
    return sum
  }

  public get PriceTotalConsumable():number {
    let sum = 0
    for(let slot of this.slottypes.slice(8)) {
      if( this.items_data[slot].price )
      sum += this.items_data[slot].price*this.items_data[slot].quantity
    }
    return sum
  }

  public async updatePrice() {
    for(let item in this.items_data) {
      this.items_data[item].price = await this.api.getPrice(
        this.items_data[item].itemID,
        this.items_data[item].enchantLevel,
        this.items_data[item].quality,
        this.current_city,
      );
    }
  }

  public isWeaponTwoHanded():boolean {
    if(!this.items_data["mainhand"].itemID) {
      return false
    }
    return this.api.getItemProperty(this.items_data["mainhand"].itemID)["@twohanded"] === "true"
  }

  public openOptimizer() {

    console.log("CLICK")
    const dialogRef = this.dialog.open(ManualOptimizerComponent, {
      data: {
        items_data : this.items_data,
        current_city: this.current_city
      }
    });

    dialogRef.afterClosed().subscribe(async (result:any|null) => {

    });
  }


}
