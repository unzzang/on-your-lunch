import { ApiProperty } from '@nestjs/swagger';

/** 카테고리 응답 DTO (data 필드 안의 배열 항목) */
export class CategoryResponseDto {
  @ApiProperty({ description: '카테고리 ID', example: 'cat-1' })
  id!: string;

  @ApiProperty({ description: '카테고리명', example: '한식' })
  name!: string;

  @ApiProperty({ description: '색상 코드', example: '#FF6B35' })
  colorCode!: string;

  @ApiProperty({ description: '정렬 순서', example: 1 })
  sortOrder!: number;
}

/** 알레르기 유형 응답 DTO (data 필드 안의 배열 항목) */
export class AllergyTypeResponseDto {
  @ApiProperty({ description: '알레르기 ID', example: 'allergy-1' })
  id!: string;

  @ApiProperty({ description: '알레르기명', example: '갑각류' })
  name!: string;

  @ApiProperty({ description: '정렬 순서', example: 1 })
  sortOrder!: number;
}
