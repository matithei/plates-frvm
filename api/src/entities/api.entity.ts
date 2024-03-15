import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
export enum ApiKeyType {
  paid = "paid",
  free = "free",
}
@Entity()
export class ApiKey extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  email: string;
  @Column()
  authKey: string;
  @Column()
  authType: ApiKeyType;
  @Column({ default: 0 })
  quantity: number;
  @Column({ default: 0 })
  used: number;
  @Column()
  period: "month" | "year";
  @Column()
  resetDate:Date
  @CreateDateColumn()
  createdAt: Date;
  @UpdateDateColumn()
  updatedAt: Date;

}
