import { Inject, Injectable } from '@nestjs/common';
import { CrudService } from '@base/crud.service';
import { Game } from '@entities/game.entity';
import { DatabaseToken } from '@core/database/database.providers';
import { Between, IsNull, LessThanOrEqual, Repository } from 'typeorm';
import { IServiceOptions } from '@base/interfaces/service-options.interface';
import { DiscountService } from '@modules/discount/discount.service';
import { DiscountNames } from '@modules/discount/enums/discount-names.enum';
import { ActualizeResponseDto } from '@modules/game/dto/actualize-response.dto';
import { Publisher } from '@entities/publisher.entity';
import moment = require('moment');

@Injectable()
export class GameService extends CrudService<Game> {
  protected options: IServiceOptions = {
    relations: [
      {
        name: 'discount',
      },
    ],
  };

  constructor(@Inject(DatabaseToken.GAME) repository: Repository<Game>, private readonly discountService: DiscountService) {
    super(Game, repository);
  }

  async removeOtdated(): Promise<string[]> {
    const ago18months = moment().subtract(18, 'months').toDate();
    const outdatedGames = await this.repository.find({
      releaseDate: LessThanOrEqual(ago18months),
    });
    const outdatedGameIds = outdatedGames.map((game) => game.id);
    if (outdatedGameIds.length > 0) {
      await this.repository.delete(outdatedGameIds);
    }
    return outdatedGameIds;
  }

  async setDiscountForObsolecent(): Promise<string[]> {
    const discount = await this.discountService.getDiscountByName(DiscountNames.OLDGAME);
    const ago18months = moment().subtract(18, 'months').toDate();
    const ago12months = moment().subtract(12, 'months').toDate();
    console.log(ago18months, ago12months);
    const obsolecentGames = await this.repository.find({
      releaseDate: Between(ago18months, ago12months),
      discountId: IsNull(),
    });
    const obsolecentGameIds = obsolecentGames.map((game) => game.id);
    if (obsolecentGameIds.length > 0) {
      await this.repository.update(obsolecentGameIds, { discount });
    }
    return obsolecentGameIds;
  }

  async actualize(): Promise<ActualizeResponseDto> {
    const removedGameIds = await this.removeOtdated();
    const updatedGameIds = await this.setDiscountForObsolecent();
    return {
      updatedGameIds,
      removedGameIds,
    };
  }

  async getPublisherByGameId(id: string): Promise<Publisher> {
    await this.checkAnExistingEntityById(id);
    const game = await this.repository.findOne(id, { relations: [ 'publisher' ] });
    return game.publisher;
  }
}
