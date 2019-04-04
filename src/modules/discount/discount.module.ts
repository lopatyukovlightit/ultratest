import { Module } from '@nestjs/common';
import { DiscountService } from './discount.service';
import { DatabaseModule } from '@core/database/database.module';

@Module({
  imports: [ DatabaseModule ],
  providers: [ DiscountService ],
  exports: [ DiscountService ],
})
export class DiscountModule {
}
