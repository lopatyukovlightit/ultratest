import { DatabaseModule } from '@core/database/database.module';
import { Module } from '@nestjs/common';
import { GameModule } from '@modules/game/game.module';
import { DiscountModule } from '@modules/discount/discount.module';

@Module({
  imports: [ DatabaseModule, GameModule, DiscountModule ],
  controllers: [],
  providers: [],
})
export class AppModule {
}
