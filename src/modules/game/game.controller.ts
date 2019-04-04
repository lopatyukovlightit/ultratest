import { ClassSerializerInterceptor, Controller, Get, Param, Post, UseInterceptors, UsePipes } from '@nestjs/common';
import { CrudController } from '@base/crud.controller';
import { Game } from '@entities/game.entity';
import { GameService } from '@modules/game/game.service';
import { CreateGameDto } from '@modules/game/dto/create-game.dto';
import { ResponseGameDto } from '@modules/game/dto/response-game.dto';
import { ActualizeResponseDto } from '@modules/game/dto/actualize-response.dto';
import { Publisher } from '@entities/publisher.entity';
import { ParamUuidValidationPipe } from '@core/pipes/param-uuid-validation.pipe';

@Controller('game')
export class GameController extends CrudController<Game, CreateGameDto, CreateGameDto, ResponseGameDto> {
  constructor(protected service: GameService) {
    super(service, Game, CreateGameDto, undefined, ResponseGameDto);
  }

  @Post('actualize')
  async actualize(): Promise<ActualizeResponseDto> {
    return this.service.actualize();
  }

  @UsePipes(new ParamUuidValidationPipe('id'))
  @UseInterceptors(ClassSerializerInterceptor)
  @Get(':id/publisher')
  async getPublisherByGameId(@Param('id') id: string): Promise<Publisher> {
    return await this.service.getPublisherByGameId(id);
  }
}
