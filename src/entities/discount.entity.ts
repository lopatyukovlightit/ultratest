import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { DiscountNames } from '@modules/discount/enums/discount-names.enum';
import { Game } from '@entities/game.entity';

@Entity({ name: 'discount' })
export class Discount {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    enum: DiscountNames,
    unique: true,
  })
  name: DiscountNames;

  @Column('decimal')
  percent: number;

  @OneToMany(() => Game, game => game.discount)
  games: Game[];
}
