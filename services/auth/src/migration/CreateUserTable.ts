import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateUserTable1688453927485 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "usuario" (
                "usuario_id" SERIAL NOT NULL,
                "nombre_usuario" varchar(50) NOT NULL,
                "contrasena" text NOT NULL,
                "correo" varchar(100) NOT NULL,
                "rol" varchar(20) NOT NULL DEFAULT 'user',
                "active" boolean NOT NULL DEFAULT true,
                "fecha_creacion" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                CONSTRAINT "PK_usuario_id" PRIMARY KEY ("usuario_id"),
                CONSTRAINT "UQ_usuario_nombre" UNIQUE ("nombre_usuario"),
                CONSTRAINT "UQ_usuario_correo" UNIQUE ("correo")
            )
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "usuario"`);
    }
}
