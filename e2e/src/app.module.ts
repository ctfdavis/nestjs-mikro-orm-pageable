import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import mikroOrmConfig from './mikro-orm.config';
import { AppService } from './app.service';
import { TestEntity } from './test.entity';

@Module({
    controllers: [AppController],
    providers: [AppService],
    imports: [MikroOrmModule.forRoot(mikroOrmConfig), MikroOrmModule.forFeature([TestEntity])]
})
export class ApplicationModule {}
