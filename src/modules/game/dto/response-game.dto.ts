import { Discount } from '@entities/discount.entity';
import { Exclude, Expose, Type } from 'class-transformer';

export class ResponseGameDto {
  @Expose()
  title: string;

  price: number;

  @Type(() => Date)
  releaseDate: Date;

  @Expose({
    name: 'publisher',
    toPlainOnly: true,
  })
  publisherId: string;

  @Exclude({
    toPlainOnly: true,
  })
  discountId: string;

  @Exclude({
    toPlainOnly: true,
  })
  discount: Discount;

  @Expose({
    name: 'salePrice',
    toPlainOnly: true,
  })
  get salePrice(): number {
    let salePrice = this.price;
    if (!!this.discount) {
      salePrice = parseFloat((salePrice * ((100 - this.discount.percent) / 100)).toFixed(2));
    }
    return salePrice;
  }
}
