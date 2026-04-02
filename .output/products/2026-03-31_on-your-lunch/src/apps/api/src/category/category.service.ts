import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CategoryService {
  constructor(private prisma: PrismaService) {}

  /** 카테고리 7건 조회 (sortOrder 순) */
  async findAll() {
    return this.prisma.category.findMany({
      orderBy: { sortOrder: 'asc' },
      select: {
        id: true,
        name: true,
        colorCode: true,
        sortOrder: true,
      },
    });
  }

  /** 알레르기 6건 조회 (sortOrder 순) */
  async findAllAllergyTypes() {
    return this.prisma.allergyType.findMany({
      orderBy: { sortOrder: 'asc' },
      select: {
        id: true,
        name: true,
        sortOrder: true,
      },
    });
  }
}
