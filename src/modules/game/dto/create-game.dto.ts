import { IsDateString, IsNumber, IsString, IsUUID } from 'class-validator';

export class CreateGameDto {
  @IsString()
  title: string;

  @IsNumber()
  price: number;

  @IsDateString()
  releaseDate: Date;

  @IsUUID()
  publisherId: string;
}
