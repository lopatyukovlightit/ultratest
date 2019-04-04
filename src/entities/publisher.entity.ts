import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({
  name: 'publisher',
})
export class Publisher {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  siret: number;

  @Column()
  phone: string;
}
