import { Column, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Creator } from '../creator/creator.entity';

export enum UserRole {
    ADMIN,
    MODERATOR,
    USER,
}

@Entity()
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ nullable: false, unique: true })
    username: string;

    @Column({ nullable: true, unique: true })
    email?: string;

    @Column({ type: 'enum', enum: UserRole, default: UserRole.USER })
    role: UserRole;

    @Column({ type: 'boolean', default: false })
    banned: boolean;

    @ManyToMany(() => Creator, { cascade: true })
    @JoinTable()
    favorite: Creator[];

    @Column({ nullable: true })
    // Sync their stuff without creating an account
    passphrase?: string;

    // Alias email address for better privacy when interacting with other third parties services
    @Column()
    aliasEmail: string;
}
