import {MigrationInterface, QueryRunner} from "typeorm";

export class gameTags1554385247453 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "game" ADD "tags" character varying(20) array`);
        await queryRunner.query(`ALTER TABLE "game" DROP CONSTRAINT "FK_2f2b221a8d12030c4e59d13663d"`);
        await queryRunner.query(`ALTER TABLE "game" ALTER COLUMN "publisherId" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "game" ADD CONSTRAINT "FK_2f2b221a8d12030c4e59d13663d" FOREIGN KEY ("publisherId") REFERENCES "publisher"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "game" DROP CONSTRAINT "FK_2f2b221a8d12030c4e59d13663d"`);
        await queryRunner.query(`ALTER TABLE "game" ALTER COLUMN "publisherId" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "game" ADD CONSTRAINT "FK_2f2b221a8d12030c4e59d13663d" FOREIGN KEY ("publisherId") REFERENCES "publisher"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "game" DROP COLUMN "tags"`);
    }

}
