import { Test } from '@nestjs/testing';
import { GameController } from './game.controller';
import { GameService } from '../services/game.service';
import { Game } from '../../../entities/game.entity';
import { DatabaseModule } from '../../../test/repository.mock';
import { DatabaseToken } from '../../../core/database/database.providers';
import { DiscountService } from '../../discount/discount.service';
import { Discount } from '../../../entities/discount.entity';
import { Publisher } from '../../../entities/publisher.entity';

describe('GameController', () => {
  let gameController: GameController;
  let gameService: GameService;
  beforeAll(async () => {
    const module = await Test.createTestingModule({
      controllers: [ GameController ],
      providers: [
        {
          provide: DiscountService,
          useValue: {},
        },
        GameService,
        ...DatabaseModule.create([
          {
            token: DatabaseToken.GAME,
            type: Game,
          },
          {
            token: DatabaseToken.DISCOUNT,
            type: Discount,
          },
        ]),

      ],
    }).compile();
    gameController = module.get<GameController>(GameController);
    gameService = module.get<GameService>(GameService);
  });
  describe('method: actualize', () => {
    describe('WHEN method actualize has called', () => {
      it('THEN return object with updated and deleted entity ids', async () => {
        const ids = [ '1', '2', '3' ];
        const spy1 = jest.spyOn(gameService, 'removeOutdated');
        spy1.mockImplementation(async () => ids);
        const spy2 = jest.spyOn(gameService, 'setDiscountForObsolecent');
        spy2.mockImplementation(async () => ids);
        expect(await gameController.actualize()).toMatchObject({
          updatedGameIds: ids,
          removedGameIds: ids,
        });
      });
    });
  });

  describe('method: getPublisherByGameId', () => {
    describe('WHEN method getPublisherByGameId has called with id', () => {
      it('THEN return Publisher object', async () => {
        const spy = jest.spyOn(gameService, 'getPublisherByGameId');
        spy.mockImplementation(async () => new Publisher());
        expect(await gameController.getPublisherByGameId('123')).toBeInstanceOf(Publisher);
      });
      it('THEN should call crudService.getPublisherByGameId with id', async () => {
        const id = '123';
        const spy = jest.spyOn(gameService, 'getPublisherByGameId');
        spy.mockImplementation(async () => new Publisher());
        await gameController.getPublisherByGameId(id);
        expect(spy).toHaveBeenCalledWith(id);
      });
    });
  });
});
