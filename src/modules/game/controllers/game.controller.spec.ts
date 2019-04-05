import { Test } from '@nestjs/testing';
import { GameController } from './game.controller';
import { GameService } from '../services/game.service';
import { Game } from '../../../entities/game.entity';
import { DatabaseModule } from '../../../test/repository.mock';
import { DatabaseToken } from '../../../core/database/database.providers';
import { DiscountService } from '../../discount/discount.service';
import { Discount } from '../../../entities/discount.entity';

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
  describe('test', () => {
    it('test', () => {
      expect(true).toBe(true);
    });
  });
});
