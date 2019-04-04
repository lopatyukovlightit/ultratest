import { Module } from '@nestjs/common';
import { GameController } from './game.controller';
import { GameService } from './game.service';
import { DatabaseModule } from '@core/database/database.module';
import { DiscountModule } from '@modules/discount/discount.module';

@Module({
  imports: [ DatabaseModule, DiscountModule ],
  controllers: [ GameController ],
  providers: [ GameService ],
})
export class GameModule {
}
