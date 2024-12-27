import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { RecipeModule } from './recipe/recipe.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [PrismaModule, RecipeModule, UserModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
