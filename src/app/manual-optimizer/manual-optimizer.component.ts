import { Component, Inject, Input, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { RequestService } from '../_services/request-service.service';
import { ItemData } from '../ItemData.class';
import {MatTabsModule} from '@angular/material/tabs';

@Component({
  selector: 'app-manual-optimizer',
  standalone: true,
  imports: [MatTabsModule],
  templateUrl: './manual-optimizer.component.html',
  styleUrl: './manual-optimizer.component.scss'
})
export class ManualOptimizerComponent implements OnInit {
  public slottypes:string[] = ["cape","head","armor","mainhand","offhand","shoes","bag","mount","food","potion"]
  public alts:{[slot:string]:any[]} = {}
  public prices:{prices:any, history:any}|undefined = undefined
  public floor:Function = Math.floor
  public sign:Function = Math.sign
  rdy:boolean = false
  constructor(
    public dialogRef: MatDialogRef<ManualOptimizerComponent>,
    public api: RequestService,
    @Inject(MAT_DIALOG_DATA) public data:{items_data :{[id:string]:ItemData}, current_city:string},
  ) {}

  async ngOnInit() {
    for(let slot of this.slottypes.slice(0,6)) {
      if(this.data.items_data[slot].itemID){
        this.alts[slot] = this.generateAllAlternatives(this.data.items_data[slot])
      }
      else {
        this.alts[slot] = []
      }
    }
    let all_items:any[] = []
    for(let slot in this.alts) {
      all_items = all_items.concat(this.alts[slot])
    }
    this.prices = await this.api.getPriceBulk(all_items,this.data.current_city)
    //console.log(this.prices)
    this.rdy = true
  }

  private generateAllAlternatives(item:ItemData):any[] {
    let alts = []
    for(let tier of [4,5,6,7,8]) {
      let newEL = item.enchantLevel - (tier - item.itemLevel)
      if(newEL >= 0 && newEL <= 4) {
        let id = item.itemID[0] + tier + item.itemID.slice(2)
        for(let qualities of [1,2,3,4,5] ) {
          alts.push({itemID : id, enchantLevel : newEL, quality : qualities })
        }
      }
    }
    return alts
  }

  public findPriceAndHistory(item:{itemID:string,enchantLevel:number,quality:number}):{price:any,history:any} {
    let ret = {price:undefined,history:undefined}
    let namelook:string = item.itemID+(item.enchantLevel === 0 ? '' : '@'+item.enchantLevel)
    if(this.prices) {
      for(let pr of this.prices.prices) {
        if(pr.item_id === namelook && pr.quality === item.quality && pr.quality) {
          ret.price = pr
        }
      }
      for(let pr of this.prices.history) {
        if(pr.item_id === namelook && pr.quality === item.quality && pr.quality) {
          ret.history = pr
        }
      }
    }
    return ret
  }

  public readPrice(slot:string,index:number):number {
    if(this.alts[slot][index].price !== undefined && this.alts[slot][index].price !== null) {
      return this.alts[slot][index].price
    } else {
      this.alts[slot][index].price = 0
      let ph = this.findPriceAndHistory(this.alts[slot][index])
      if(ph.history && ph.history.data[0].length > 0){
        let history_slice = ph.history.data[0].slice(Math.max(0,ph.history[0].data.length-5),ph.history[0].data.length)
        let count = 0
        let sum = 0
        for(let hs of history_slice) {
          count += hs['item_count']
          sum += hs['avg_price']*hs['item_count']
        }
        let mean = sum/count
        if(ph.price){
          if(ph.price && (ph.price["sell_price_min"] > mean*4+1000 || ph.price[0]["sell_price_min"] <= 0)) {
            console.log("WRONG PRICE : "+this.alts[slot][index].itemID+" ("+ph.price[0]["sell_price_min"]+" => "+Math.floor(mean)+")")
            this.alts[slot][index].price = Math.floor(mean)
          }
          this.alts[slot][index].price =  ph.price["sell_price_min"]
        }
      } else if(ph.price) {
        this.alts[slot][index].price =  ph.price["sell_price_min"]
      }
      return this.alts[slot][index].price
    }
  }

  public readIP (slot:string,index:number):number {
    if(this.alts[slot][index].IP !== undefined && this.alts[slot][index].IP !== null) {
      return this.alts[slot][index].IP
    } else {
      this.alts[slot][index].IP = this.api.getItemPower(this.alts[slot][index].itemID,this.alts[slot][index].enchantLevel,this.alts[slot][index].quality)
      return this.alts[slot][index].IP
    }
  }
}
