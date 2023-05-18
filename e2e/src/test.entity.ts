import { Entity, PrimaryKey, Property } from '@mikro-orm/core';

@Entity()
export class TestEntity {
    constructor(id: number, title: string, description: string | null, createdAt: Date, updatedAt: Date) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    @PrimaryKey()
    id!: number;
    @Property()
    title!: string;
    @Property({ nullable: true })
    description!: string | null;
    @Property({ type: 'date', onCreate: () => new Date() })
    createdAt: Date = new Date();
    @Property({ type: 'date', onUpdate: () => new Date() })
    updatedAt: Date = new Date();
}
