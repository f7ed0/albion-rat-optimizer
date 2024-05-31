import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class PriceFormatter {
  public formatPrice(value:number):string {
    if(value >= 1000000) {
      let x = Math.floor(value/1000)
      return x/1000+" M"
    }
    if(value >= 100000) {
      let x = Math.floor(value/10)
      return x/100+" K"
    }
    if(value >= 1000) {
      let x = Math.floor(value/1000)
      let y = value%1000
      
      return x+" "+y+(y < 10 ? "00" : y < 100 ? "0" : "")
    }
    //console.log(value)
    if(!value) {
      return "NO PRICE"
    }
    return value.toString()
  }

  public formatWholePrice(value:number):string {
    let a:string[] = []
    while(value > 1000) {
      let x = value%1000 
      a.push(x+(x < 10 ? "00" : x < 100 ? "0" : ""))
      value = Math.floor(value/1000)
    }
    return value+" "+a.reverse().join(" ")
  }

}