import { Controller, Get } from '@nestjs/common';
import { CategoryService } from './category.service';
import { Public } from '../auth/decorators/public.decorator';

@Controller()
export class CategoryController {
  constructor(private categoryService: CategoryService) {}

  /** GET /categories — 카테고리 목록 [Public] */
  @Public()
  @Get('categories')
  getCategories() {
    return this.categoryService.findAll();
  }

  /** GET /allergy-types — 알레르기 목록 [Public] */
  @Public()
  @Get('allergy-types')
  getAllergyTypes() {
    return this.categoryService.findAllAllergyTypes();
  }
}
