import { Component, EventEmitter, Input, Output } from '@angular/core'
import {MatDialog} from '@angular/material/dialog'
import {SelectDialogComponent} from './select-dialog/select-dialog.component'
import { ItemData } from '../ItemData.class';
import { RequestService } from '../_services/request-service.service';

@Component({
  selector: 'app-item-holder',
  standalone: true,
  imports: [],
  templateUrl: './item-holder.component.html',
  styleUrl: './item-holder.component.scss'
})
export class ItemHolderComponent {
  @Input() slot:"offhand"|"cape"|"shoes"|"head"|"armor"|"mainhand"|"mount"|"food"|"potion"|"bag" = "armor";
  @Input() data: ItemData = new ItemData()
  @Output() dataChange = new EventEmitter<ItemData>()
  @Input() currentCity:string = "Brecilien"
  @Input() disabled:boolean = false
  @Input() dataReplacement: ItemData = new ItemData()

  constructor(
    private dialog:MatDialog,
    private api:RequestService
  ) {}

  async openDialog() {
    if(this.disabled) {
      return
    }
    console.log("CLICK")
    const dialogRef = this.dialog.open(SelectDialogComponent, {
      data: {itemID : this.data.itemID, enchantLevel :  this.data.enchantLevel, itemLevel : this.data.itemLevel, quality : this.data.quality, slot : this.slot},
    });

    dialogRef.afterClosed().subscribe(async (result:any|null) => {
      if(result){
        this.data.itemID = result.itemID;
        this.data.enchantLevel = result.enchantLevel;
        this.data.itemLevel = result.itemLevel;
        this.data.quality = result.quality;
        this.data.price = (await this.api.getPrice(result.itemID,result.enchantLevel,result.quality,this.currentCity))
        this.data.IP = this.api.getItemPower(result.itemID,result.enchantLevel,result.quality)
      }
      this.dataChange.emit(this.data);
      
      console.log('The dialog was closed');
    });
  }


  get item_url() {
    if(this.disabled) {
      if(this.dataReplacement.itemID) {
        return `https://render.albiononline.com/v1/item/${this.dataReplacement.itemID}@${this.dataReplacement.enchantLevel}.png?quality=${this.dataReplacement.quality}`
      }
      return ''
    }
    if(this.data.itemID) {
      return `https://render.albiononline.com/v1/item/${this.data.itemID}@${this.data.enchantLevel}.png?quality=${this.data.quality}`
    }
    return ''
  }
}
