import { api } from './api';
import type {
  ApiResponse,
  GoogleLoginRequest,
  GoogleLoginResponse,
} from '@on-your-lunch/shared-types';

/**
 * 인증 API 서비스
 */

/** Google 로그인 */
export async function loginWithGoogle(
  params: GoogleLoginRequest,
): Promise<GoogleLoginResponse> {
  const response = await api
    .post('auth/google', { json: params })
    .json<ApiResponse<GoogleLoginResponse>>();
  return response.data;
}

/** 로그아웃 (서버에 리프레시 토큰 무효화 요청) */
export async function logoutFromServer(): Promise<void> {
  await api.post('auth/logout');
}

/** 회원 탈퇴 */
export async function withdrawUser(): Promise<void> {
  await api.delete('users/me');
}
