import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateRecipeDto } from './dto/create-recipe.dto';
import { UpdateRecipeDto } from './dto/update-recipe.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class RecipeService {
  constructor(private readonly prisma: PrismaService) {}
  async create(createRecipeDto: CreateRecipeDto) {
    try {
      return await this.prisma.recipe.create({
        data: createRecipeDto,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        // Unique constraint failed
        if (error.code === 'P2002') {
          throw new HttpException(
            'Recipe title must be unique',
            HttpStatus.CONFLICT,
          );
        }
      }

      throw new HttpException(
        'Error creating recipe',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  findAll() {
    return this.prisma.recipe.findMany();
  }

  findOne(id: number) {
    return this.prisma.recipe.findUnique({
      where: {
        id,
      },
    });
  }

  async update(id: number, updateRecipeDto: UpdateRecipeDto) {
    try {
      return await this.prisma.recipe.update({
        where: {
          id,
        },
        data: updateRecipeDto,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new HttpException(
            'Recipe title must be unique',
            HttpStatus.CONFLICT,
          );
        }
      }
    }
  }

  async remove(id: number) {
    try {
      return await this.prisma.recipe.delete({
        where: {
          id,
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new HttpException('Recipe not found', HttpStatus.NOT_FOUND);
        }
      }
    }
  }
}
