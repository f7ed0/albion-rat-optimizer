import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class RequestService {
  private data:{items : {[id:string]:any[]} }|null = null;
  private names:any|null = null;

  constructor(
    private api:HttpClient
  ) {}

  public async checkAndDl() {
    if(!this.data || !this.names){
      try {
        
        // @ts-expect-error
        this.data = await firstValueFrom(this.api.get("./assets/items.json"))
        let names:any = await firstValueFrom(this.api.get("./assets/items_names.json"))
        this.names = {}
        for(let item of names) {
          this.names[item["UniqueName"]] = item["LocalizedNames"]
        }
        //console.log(this.names)
      } catch (err) {
        console.error(err)
      }
    }
  }

  GetItemForSlot(slot:string):any {
    if(this.data){
      if(slot === "potion" || slot === "food") {
        return this.data.items['consumableitem'].filter((item:any) => item["@slottype"] === slot)
      }
      if(slot === "mainhand") {
        return this.data.items['weapon'].filter((item:any) => item["@slottype"] === slot)
      }
      if(slot === "mount") {
        return this.data.items['mount'].filter((item:any) => item["@slottype"] === slot)
      }
      return this.data.items['equipmentitem'].filter((item:any) => item["@slottype"] === slot)
    } else {
      return {}
    }
  }

  get quality():any {
    return {
      1 : "Normal",
      2 : "Good",
      3 : "Outstanding",
      4 : "Excellent",
      5 : "Masterpiece",
    }
  }

  get cities():{[id:string]:string} {
    return {
      "Brecilien":"Brecilien",
      "Caerleon":"Caerleon",
      "Bridgewatch":"Bridgewatch",
      "FortSterling":"Fort Sterling",
      "Martlock":"Martlock",
      "Thetford":"Thetford",
      "Lymhurst":"Lymhurst"
    }
  }

  get qualityBonus():any {
    return {
      1 : 0,
      2 : 20,
      3 : 40,
      4 : 60,
      5 : 100,
    }
  }

  getItemProperty(id:string):any|undefined {
    if(this.data) {
      for(let categ in this.data.items) {
        try {
          let r = this.data.items[categ].filter((item:any) => item["@uniquename"] === id)
          if(r.length > 0) {
            return r[0]
          }
        } catch(err) {

        }
      }
    }
    return undefined
  }

  public getLocalised(id:string,lang:string):string|undefined {
    if (this.names && this.names[id]) {
      return this.names[id][lang]
    }
    return undefined
  }

  public getItemPower(id:string,enchantlevel:number,quality:number):number {
    try{
      if(this.getItemProperty(id)){
        return Number.parseInt(
          enchantlevel === 0 ? this.getItemProperty(id)["@itempower"] : this.getItemProperty(id).enchantments.enchantment[enchantlevel-1]["@itempower"]
        ) + this.qualityBonus[quality]
            
      }
    }catch(err){
      return -100;
    }
    return 0
  }

  public async getPrice(id:string,enchantLevel:number,quality:number,city:string):Promise<any|undefined> {
    if(!id) {
      return undefined
    }
    try {
      let cur_date = new Date();
      let prev_date = (new Date(cur_date.getTime()-(10*24*60*60*1000)))
      //let cd = cur_date.getMonth()+1+"-"+cur_date.getDate()+"-"+cur_date.getFullYear()
      //let prv = prev_date.getMonth()+1+"-"+prev_date.getDate()+"-"+prev_date.getFullYear()
      let item:any = await firstValueFrom(this.api.get(`https://europe.albion-online-data.com/api/v2/stats/prices/${id}${enchantLevel === 0 ? '' : '@'+enchantLevel}?locations=${city}&qualities=${quality}`))
      let history:any = await firstValueFrom(this.api.get(`https://europe.albion-online-data.com/api/v2/stats/history/${id}${enchantLevel === 0 ? '' : '@'+enchantLevel}?locations=${city}&qualities=${quality}&time-scale=24`))
      if(history.length > 0){
        let history_slice = history[0].data.slice(Math.max(0,history[0].data.length-5),history[0].data.length)
        let count = 0
        let sum = 0
        for(let item of history_slice) {
          count += item['item_count']
          sum += item['avg_price']*item['item_count']
        }
        let mean = sum/count
        if(item[0]["sell_price_min"] > mean*4+1000 || item[0]["sell_price_min"] <= 0) {
          console.log("WRONG PRICE : "+id+" ("+item[0]["sell_price_min"]+" => "+Math.floor(mean)+")")
          return Math.floor(mean)
        }
      }
      return item[0]["sell_price_min"]
    } catch(err) {
      return undefined
    }
  }

  public async getPriceBulk(items:{itemID:string,enchantLevel:number}[],city:string):Promise<{prices:any, history:any}|undefined> {
    let names:string[] = []
    for(let item of items) {
      if(!item.itemID){
        return
      }
      names.push(item.itemID+(item.enchantLevel === 0 ? '' : '@'+item.enchantLevel))
    }
    console.log(items)
    console.log(names)
    try {
      let cur_date = new Date();
      let prev_date = (new Date(cur_date.getTime()-(10*24*60*60*1000)))
      //let cd = cur_date.getMonth()+1+"-"+cur_date.getDate()+"-"+cur_date.getFullYear()
      //let prv = prev_date.getMonth()+1+"-"+prev_date.getDate()+"-"+prev_date.getFullYear()
      let item:any = await firstValueFrom(this.api.get(`https://europe.albion-online-data.com/api/v2/stats/prices/${names.join(",")}?locations=${city}`))
      let history:any = await firstValueFrom(this.api.get(`https://europe.albion-online-data.com/api/v2/stats/history/${names.join(",")}?locations=${city}&time-scale=24`))
      return {prices : item,history : history}
    } catch(err) {
      return undefined
    }
  }
}
