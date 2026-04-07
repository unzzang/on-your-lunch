import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiExtraModels } from '@nestjs/swagger';
import { CategoryService } from './category.service';
import { Public } from '../auth/decorators/public.decorator';
import { CategoryResponseDto, AllergyTypeResponseDto } from './dto/category-response.dto';

@ApiTags('카테고리')
@ApiExtraModels(CategoryResponseDto, AllergyTypeResponseDto)
@Controller('categories')
export class CategoryController {
  constructor(private categoryService: CategoryService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: '음식 카테고리 전체 조회' })
  @ApiResponse({ status: 200, description: '카테고리 7건 반환. data 필드 안에 배열로 반환.', type: [CategoryResponseDto] })
  findAll() {
    return this.categoryService.findAll();
  }

  @Public()
  @Get('allergies')
  @ApiOperation({ summary: '알레르기 유형 전체 조회' })
  @ApiResponse({ status: 200, description: '알레르기 6건 반환. data 필드 안에 배열로 반환.', type: [AllergyTypeResponseDto] })
  findAllAllergies() {
    return this.categoryService.findAllAllergies();
  }
}
