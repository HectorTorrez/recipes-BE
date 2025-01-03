import { PartialType } from '@nestjs/swagger';
import { CreateRecipeDto } from './create-recipe.dto';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateRecipeDto extends PartialType(CreateRecipeDto) {
  @IsString()
  @IsOptional()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  ingredients: string;

  @IsString()
  @IsOptional()
  instructions: string;

  @IsNumber()
  @IsOptional()
  userId: number;
}
