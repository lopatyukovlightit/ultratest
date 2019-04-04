import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Publisher } from '@entities/publisher.entity';
import { Discount } from '@entities/discount.entity';

@Entity({
  name: 'game',
})
export class Game {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column()
  price: number;

  @Column()
  releaseDate: Date;

  @Column({ nullable: false, select: true })
  publisherId: string;

  @Column('varchar', {
    array: true,
    length: 20,
    nullable: true,
  })
  public tags: string[];

  @ManyToOne(() => Publisher, { nullable: false })
  publisher: Publisher;

  @Column({
    nullable: true,
  })
  discountId: string;

  @ManyToOne(() => Discount, discount => discount.games, {
    eager: true,
  })
  discount: Discount;
}
