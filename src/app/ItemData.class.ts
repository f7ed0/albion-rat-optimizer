export class ItemData {
    public itemID:string = ""
    public itemLevel:number = 3 
    public enchantLevel:number = 0
    public quality:number = 1
    public price:number = 0
    public IP:number = 0
    public quantity:number = 1
    
    public constructor(itemID?:string, itemLevel?:number, enchantLevel?:number, quality?:number, quantity?:number) {
        if(itemID) {
            this.itemID = itemID
        }
        if(enchantLevel) {
            this.enchantLevel = enchantLevel
        }
        if(itemLevel) {
            this.itemLevel = itemLevel
        }
        if(quality) {
            this.quality = quality
        }
        if(quantity) {
            this.quantity = quantity
        }
    }

    public fromRandomObject(json:any) {
        if(json.itemID) {
            this.itemID = json.itemID
        }
        if(json.enchantLevel) {
            this.enchantLevel = json.enchantLevel
        }
        if(json.itemLevel) {
            this.itemLevel = json.itemLevel
        }
        if(json.quality) {
            this.quality = json.quality
        }
    }

    public toJson():string {
        return JSON.stringify(this)
    }  

    public updateQuantity(value:number) {
        if(value < 0) {
            this.quantity = 0;
        }
        if(value > 5) {
            this.quantity = 5;
        }
        this.quantity = value
    }
}