import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(__dirname, '../../../.env'), override: true });

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { ResponseInterceptor } from '../src/common/interceptors/response.interceptor';
import { GlobalExceptionFilter } from '../src/common/filters/http-exception.filter';

describe('온유어런치 API (e2e)', () => {
  let app: INestApplication;
  let accessToken: string;
  let server: any;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('v1');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      }),
    );
    app.useGlobalInterceptors(new ResponseInterceptor());
    app.useGlobalFilters(new GlobalExceptionFilter());

    await app.init();
    server = app.getHttpServer();
  });

  afterAll(async () => {
    await app.close();
  });

  // ────────────────────────────────────────────
  // Auth
  // ────────────────────────────────────────────
  describe('Auth', () => {
    it('POST /v1/auth/dev-login -> 토큰 발급', async () => {
      const res = await request(server)
        .post('/v1/auth/dev-login')
        .send({})
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('accessToken');
      expect(res.body.data).toHaveProperty('refreshToken');
      expect(res.body.data).toHaveProperty('user');
      expect(res.body.data.user).toHaveProperty('id');
      expect(res.body.data.user).toHaveProperty('email');
      expect(res.body.data.user).toHaveProperty('nickname');
      expect(typeof res.body.data.accessToken).toBe('string');
      expect(typeof res.body.data.refreshToken).toBe('string');

      accessToken = res.body.data.accessToken;
    });

    it('POST /v1/auth/refresh -> 토큰 갱신', async () => {
      // 먼저 dev-login으로 refreshToken 발급
      const loginRes = await request(server)
        .post('/v1/auth/dev-login')
        .send({});

      const refreshToken = loginRes.body.data.refreshToken;

      const res = await request(server)
        .post('/v1/auth/refresh')
        .send({ refreshToken })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('accessToken');
      expect(res.body.data).toHaveProperty('refreshToken');
    });
  });

  // ────────────────────────────────────────────
  // Categories
  // ────────────────────────────────────────────
  describe('Categories', () => {
    it('GET /v1/categories -> 7건 반환', async () => {
      const res = await request(server)
        .get('/v1/categories')
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data).toHaveLength(7);

      // 필드 완전성 검증
      const category = res.body.data[0];
      expect(category).toHaveProperty('id');
      expect(category).toHaveProperty('name');
      expect(category).toHaveProperty('colorCode');
      expect(category).toHaveProperty('sortOrder');
    });

    it('GET /v1/categories/allergies -> 6건 반환', async () => {
      const res = await request(server)
        .get('/v1/categories/allergies')
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data).toHaveLength(6);

      // 필드 완전성 검증
      const allergy = res.body.data[0];
      expect(allergy).toHaveProperty('id');
      expect(allergy).toHaveProperty('name');
      expect(allergy).toHaveProperty('sortOrder');
    });
  });

  // ────────────────────────────────────────────
  // Restaurants
  // ────────────────────────────────────────────
  describe('Restaurants', () => {
    it('GET /v1/restaurants -> items 배열 + latitude/longitude 필드', async () => {
      const res = await request(server)
        .get('/v1/restaurants')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('items');
      expect(Array.isArray(res.body.data.items)).toBe(true);
      expect(res.body.data).toHaveProperty('meta');

      if (res.body.data.items.length > 0) {
        const item = res.body.data.items[0];
        expect(item).toHaveProperty('id');
        expect(item).toHaveProperty('name');
        expect(item).toHaveProperty('latitude');
        expect(item).toHaveProperty('longitude');
        expect(item).toHaveProperty('category');
        expect(item.category).toHaveProperty('colorCode');
        expect(item).toHaveProperty('walkMinutes');
        expect(item).toHaveProperty('priceRange');
        expect(item).toHaveProperty('isFavorite');
        expect(typeof item.latitude).toBe('number');
        expect(typeof item.longitude).toBe('number');
      }
    });

    it('GET /v1/restaurants/:id -> RestaurantDetail 필드', async () => {
      // 먼저 목록에서 ID 가져오기
      const listRes = await request(server)
        .get('/v1/restaurants')
        .set('Authorization', `Bearer ${accessToken}`);

      if (listRes.body.data.items.length === 0) {
        console.warn('식당 데이터 없음 — 상세 테스트 스킵');
        return;
      }

      const restaurantId = listRes.body.data.items[0].id;

      const res = await request(server)
        .get(`/v1/restaurants/${restaurantId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      const detail = res.body.data;
      expect(detail).toHaveProperty('id');
      expect(detail).toHaveProperty('name');
      expect(detail).toHaveProperty('category');
      expect(detail.category).toHaveProperty('id');
      expect(detail.category).toHaveProperty('name');
      expect(detail.category).toHaveProperty('colorCode');
      expect(detail).toHaveProperty('address');
      expect(detail).toHaveProperty('latitude');
      expect(detail).toHaveProperty('longitude');
      expect(detail).toHaveProperty('walkMinutes');
      expect(detail).toHaveProperty('phone');
      expect(detail).toHaveProperty('priceRange');
      expect(detail).toHaveProperty('photos');
      expect(detail).toHaveProperty('menus');
      expect(detail).toHaveProperty('isFavorite');
      expect(detail).toHaveProperty('isClosed');
      expect(typeof detail.latitude).toBe('number');
      expect(typeof detail.longitude).toBe('number');
    });

    it('GET /v1/restaurants/map -> pins 배열', async () => {
      const res = await request(server)
        .get('/v1/restaurants/map')
        .query({
          swLat: 37.49,
          swLng: 127.02,
          neLat: 37.51,
          neLng: 127.04,
        })
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('pins');
      expect(Array.isArray(res.body.data.pins)).toBe(true);
      expect(res.body.data).toHaveProperty('totalCount');

      if (res.body.data.pins.length > 0) {
        const pin = res.body.data.pins[0];
        expect(pin).toHaveProperty('id');
        expect(pin).toHaveProperty('name');
        expect(pin).toHaveProperty('categoryColorCode');
        expect(pin).toHaveProperty('latitude');
        expect(pin).toHaveProperty('longitude');
        expect(pin).toHaveProperty('walkMinutes');
        expect(typeof pin.latitude).toBe('number');
        expect(typeof pin.longitude).toBe('number');
      }
    });
  });

  // ────────────────────────────────────────────
  // Recommendations
  // ────────────────────────────────────────────
  describe('Recommendations', () => {
    it('GET /v1/recommendations/today -> restaurants 배열 + latitude/longitude', async () => {
      const res = await request(server)
        .get('/v1/recommendations/today')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('restaurants');
      expect(Array.isArray(res.body.data.restaurants)).toBe(true);
      expect(res.body.data).toHaveProperty('refreshCount');
      expect(res.body.data).toHaveProperty('maxRefreshCount');
      expect(res.body.data).toHaveProperty('filterApplied');

      if (res.body.data.restaurants.length > 0) {
        const r = res.body.data.restaurants[0];
        expect(r).toHaveProperty('id');
        expect(r).toHaveProperty('name');
        expect(r).toHaveProperty('latitude');
        expect(r).toHaveProperty('longitude');
        expect(r).toHaveProperty('category');
        expect(r.category).toHaveProperty('colorCode');
        expect(r).toHaveProperty('walkMinutes');
        expect(r).toHaveProperty('priceRange');
        expect(typeof r.latitude).toBe('number');
        expect(typeof r.longitude).toBe('number');
      }
    });
  });

  // ────────────────────────────────────────────
  // Eating Histories — CRUD
  // ────────────────────────────────────────────
  describe('Eating Histories', () => {
    let historyId: string;
    let restaurantId: string;

    beforeAll(async () => {
      // 식당 목록에서 ID 가져오기
      const listRes = await request(server)
        .get('/v1/restaurants')
        .set('Authorization', `Bearer ${accessToken}`);

      if (listRes.body.data.items.length > 0) {
        restaurantId = listRes.body.data.items[0].id;
      }
    });

    it('POST /v1/eating-histories -> 기록 생성', async () => {
      if (!restaurantId) {
        console.warn('식당 데이터 없음 — 기록 생성 테스트 스킵');
        return;
      }

      const res = await request(server)
        .post('/v1/eating-histories')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          restaurantId,
          eatenDate: new Date().toISOString(),
          rating: 4,
          memo: 'e2e 테스트 기록',
          isFromRecommendation: false,
        })
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('id');
      expect(res.body.data).toHaveProperty('rating', 4);
      expect(res.body.data).toHaveProperty('memo', 'e2e 테스트 기록');
      historyId = res.body.data.id;
    });

    it('PATCH /v1/eating-histories/:id -> 기록 수정', async () => {
      if (!historyId) {
        console.warn('기록 ID 없음 — 수정 테스트 스킵');
        return;
      }

      const res = await request(server)
        .patch(`/v1/eating-histories/${historyId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ rating: 5, memo: '수정된 메모' })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('rating', 5);
      expect(res.body.data).toHaveProperty('memo', '수정된 메모');
    });

    it('GET /v1/eating-histories/calendar -> days 배열', async () => {
      const now = new Date();
      const res = await request(server)
        .get('/v1/eating-histories/calendar')
        .query({ year: now.getFullYear(), month: now.getMonth() + 1 })
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('days');
      expect(Array.isArray(res.body.data.days)).toBe(true);

      if (res.body.data.days.length > 0) {
        const day = res.body.data.days[0];
        expect(day).toHaveProperty('date');
        expect(day).toHaveProperty('records');
        expect(Array.isArray(day.records)).toBe(true);
      }
    });

    it('DELETE /v1/eating-histories/:id -> 기록 삭제', async () => {
      if (!historyId) {
        console.warn('기록 ID 없음 — 삭제 테스트 스킵');
        return;
      }

      const res = await request(server)
        .delete(`/v1/eating-histories/${historyId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
    });
  });

  // ────────────────────────────────────────────
  // Favorites
  // ────────────────────────────────────────────
  describe('Favorites', () => {
    it('POST /v1/favorites/toggle -> isFavorite 토글', async () => {
      // 식당 ID 확보
      const listRes = await request(server)
        .get('/v1/restaurants')
        .set('Authorization', `Bearer ${accessToken}`);

      if (listRes.body.data.items.length === 0) {
        console.warn('식당 데이터 없음 — 즐겨찾기 테스트 스킵');
        return;
      }

      const restaurantId = listRes.body.data.items[0].id;

      // 1차 토글 (추가)
      const res1 = await request(server)
        .post('/v1/favorites/toggle')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ restaurantId })
        .expect(200);

      expect(res1.body.success).toBe(true);
      expect(res1.body.data).toHaveProperty('isFavorite');
      const firstState = res1.body.data.isFavorite;

      // 2차 토글 (제거)
      const res2 = await request(server)
        .post('/v1/favorites/toggle')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ restaurantId })
        .expect(200);

      expect(res2.body.success).toBe(true);
      expect(res2.body.data.isFavorite).toBe(!firstState);
    });
  });

  // ────────────────────────────────────────────
  // Users
  // ────────────────────────────────────────────
  describe('Users', () => {
    it('GET /v1/users/me -> 프로필 필드', async () => {
      const res = await request(server)
        .get('/v1/users/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      const profile = res.body.data;
      expect(profile).toHaveProperty('id');
      expect(profile).toHaveProperty('email');
      expect(profile).toHaveProperty('nickname');
      expect(profile).toHaveProperty('isOnboardingCompleted');
    });

    it('GET /v1/users/me/notification -> 알림 설정', async () => {
      const res = await request(server)
        .get('/v1/users/me/notification')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('enabled');
      expect(res.body.data).toHaveProperty('time');
    });

    it('PUT /v1/users/me/notification -> 알림 설정 변경', async () => {
      const res = await request(server)
        .put('/v1/users/me/notification')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          enabled: true,
          time: '11:30',
        })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('enabled');
      expect(res.body.data).toHaveProperty('time');
    });
  });

  // ────────────────────────────────────────────
  // Events
  // ────────────────────────────────────────────
  describe('Events', () => {
    it('POST /v1/events -> 이벤트 기록', async () => {
      const res = await request(server)
        .post('/v1/events')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          eventName: 'test_event',
          eventData: { screen: 'home' },
        })
        .expect(201);

      expect(res.body.success).toBe(true);
    });
  });

  // ────────────────────────────────────────────
  // Share
  // ────────────────────────────────────────────
  describe('Share', () => {
    it('GET /v1/share/restaurant/:id -> 공유 링크', async () => {
      const listRes = await request(server)
        .get('/v1/restaurants')
        .set('Authorization', `Bearer ${accessToken}`);

      if (listRes.body.data.items.length === 0) {
        console.warn('식당 데이터 없음 — 공유 테스트 스킵');
        return;
      }

      const restaurantId = listRes.body.data.items[0].id;

      const res = await request(server)
        .get(`/v1/share/restaurant/${restaurantId}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('shareUrl');
    });
  });
});
