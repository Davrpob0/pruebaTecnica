import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity("usuario") // Nombre de la tabla en la base de datos
export class User {
    @PrimaryGeneratedColumn({ name: "usuario_id" })
    id!: number;

    @Column({ name: "nombre_usuario", type: "varchar", length: 50 })
    username!: string;

    @Column({ name: "contrasena", type: "text" })
    password!: string;

    @Column({ name: "correo", type: "varchar", length: 100 })
    email!: string;

    @Column({ name: "rol", type: "varchar", length: 20, default: "student" })
    role!: string;

    @Column({ name: "active", type: "boolean", default: true })
    isActive!: boolean;

    @Column({ name: "fecha_creacion", type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
    createdAt!: Date;
}
