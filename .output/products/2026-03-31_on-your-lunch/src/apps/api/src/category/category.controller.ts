import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CategoryService } from './category.service';

@ApiTags('마스터 데이터')
@Controller()
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get('categories')
  @ApiOperation({ summary: '카테고리 목록 조회 (인증 불필요)' })
  async getCategories() {
    return this.categoryService.getCategories();
  }

  @Get('allergy-types')
  @ApiOperation({ summary: '알레르기 목록 조회 (인증 불필요)' })
  async getAllergyTypes() {
    return this.categoryService.getAllergyTypes();
  }
}
