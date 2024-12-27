import { PartialType } from '@nestjs/swagger';
import { CreateRecipeDto } from './create-recipe.dto';
import { IsOptional, IsString } from 'class-validator';
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
}
