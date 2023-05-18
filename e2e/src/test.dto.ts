export class TestDto {
    constructor(id: number, title: string, description: string | null, createdAt: Date, updatedAt: Date) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }
    id!: number;
    title!: string;
    description!: string | null;
    createdAt!: Date;
    updatedAt!: Date;
}
