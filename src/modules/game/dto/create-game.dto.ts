import { Allow, IsDateString, IsNumber, IsString, IsUUID, Length } from 'class-validator';

export class CreateGameDto {
  @IsString()
  title: string;

  @IsNumber()
  price: number;

  @IsDateString()
  releaseDate: Date;

  @IsUUID()
  publisherId: string;

  @Allow()
  @Length(2, 20, {
    each: true,
  })
  public tags: string[];
}
