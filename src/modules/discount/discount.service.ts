import { Inject, Injectable } from '@nestjs/common';
import { CrudService } from '@base/services/crud.service';
import { Discount } from '@entities/discount.entity';
import { DatabaseToken } from '@core/database/database.providers';
import { Repository } from 'typeorm';
import { DiscountNames } from '@modules/discount/enums/discount-names.enum';

@Injectable()
export class DiscountService extends CrudService<Discount> {
  constructor(@Inject(DatabaseToken.DISCOUNT) repository: Repository<Discount>) {
    super(Discount, repository);
  }

  public async getDiscountByName(name: DiscountNames): Promise<Discount> {
    return this.repository.findOneOrFail({ name });
  }
}
