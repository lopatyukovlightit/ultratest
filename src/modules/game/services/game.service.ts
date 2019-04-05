import { Inject, Injectable } from '@nestjs/common';
import { CrudService } from '@base/services/crud.service';
import { Game } from '@entities/game.entity';
import { DatabaseToken } from '@core/database/database.providers';
import { Between, IsNull, LessThanOrEqual, Repository } from 'typeorm';
import { IServiceOptions } from '@base/interfaces/service-options.interface';
import { DiscountService } from '../../discount/discount.service';
import { DiscountNames } from '../../discount/enums/discount-names.enum';
import { ActualizeResponseDto } from '../dto/actualize-response.dto';
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

  /**
   * Deletes games that have the releaseDate older than 18 months
   * @returns Promise<string[]> - removed games (ids)
   */
  async removeOutdated(): Promise<string[]> {
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

  /**
   * Adds the old game discount to games, that have the releaseDate between 18 and 12 months old
   * @returns Promise<string[]> - updated games (ids)
   */
  async setDiscountForObsolecent(): Promise<string[]> {
    const discount = await this.discountService.getDiscountByName(DiscountNames.OLDGAME);
    const ago18months = moment().subtract(18, 'months').toDate();
    const ago12months = moment().subtract(12, 'months').toDate();
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

  /**
   * Deletes games that have the releaseDate older than 18 months
   * Adds the default discount to games, that have the releaseDate between 18 and 12 months old
   * @returns Promise<ActualizeResponseDto>
   */
  async actualize(): Promise<ActualizeResponseDto> {
    const removedGameIds = await this.removeOutdated();
    const updatedGameIds = await this.setDiscountForObsolecent();
    return {
      updatedGameIds,
      removedGameIds,
    };
  }

  /**
   * Find game by UUID and return its publisher, throw 404 if not found
   * @param {string} id - game UUID
   * @returns Promise<Publisher>
   */
  async getPublisherByGameId(id: string): Promise<Publisher> {
    await this.checkAnExistingEntityById(id);
    const game = await this.repository.findOne(id, { relations: [ 'publisher' ] });
    return game.publisher;
  }
}
