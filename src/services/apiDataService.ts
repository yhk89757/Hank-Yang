/**
 * 云端优先数据服务
 *
 * 策略：API 优先 → 本地兜底
 * 1) 优先从 Lighthouse 后端 API 读取/写入
 * 2) API 不可用时自动回退到 localStorage
 * 3) 支持随时切换 API 地址（通过 localStorage 配置）
 *
 * 部署时只需设置 VITE_API_BASE_URL 环境变量指向 Lighthouse 服务器 IP:端口。
 */

import * as localStorageService from './localStorageService';

// ========== 配置 ==========

const DEFAULT_API_BASE = (import.meta as any).env?.VITE_API_BASE_URL || '';

function getApiBase(): string {
  // 允许运行时覆盖（存储在 localStorage 中）
  const custom = localStorage.getItem('lighthouse_api_base');
  if (custom) return custom;
  return DEFAULT_API_BASE;
}

export function setApiBase(url: string): void {
  localStorage.setItem('lighthouse_api_base', url);
}

/**
 * 检查 API 是否可用
 */
async function isApiAvailable(): Promise<boolean> {
  const base = getApiBase();
  if (!base) return false;
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);
    const resp = await fetch(`${base}/api/health`, { signal: controller.signal });
    clearTimeout(timeout);
    return resp.ok;
  } catch {
    return false;
  }
}

// ========== 通用 fetch 封装（带重试 + 超时） ==========

async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
  fallback: () => T,
  retries = 1
): Promise<{ data: T; source: 'api' | 'local' }> {
  const base = getApiBase();
  if (!base) return { data: fallback(), source: 'local' };

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);
      const resp = await fetch(`${base}${path}`, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        }
      });
      clearTimeout(timeout);

      if (resp.ok) {
        const data = await resp.json();
        return { data, source: 'api' };
      }

      if (resp.status >= 500) throw new Error(`Server error ${resp.status}`);
      // 4xx 不重试
      return { data: fallback(), source: 'local' };
    } catch (err) {
      if (attempt === retries) {
        console.warn(`[API] ${path} 失败，回退到本地:`, (err as Error).message);
        return { data: fallback(), source: 'local' };
      }
      await new Promise(r => setTimeout(r, 1000));
    }
  }

  return { data: fallback(), source: 'local' };
}

// ========== Candidates ==========

export async function getCandidates() {
  return apiFetch(
    '/api/candidates',
    {},
    () => localStorageService.getCandidates()
  );
}

export async function addCandidate(candidate: any) {
  return apiFetch(
    '/api/candidates',
    { method: 'POST', body: JSON.stringify(candidate) },
    () => localStorageService.addCandidate(candidate)
  );
}

export async function updateCandidateStatus(name: string, status: string) {
  return apiFetch(
    '/api/candidates/status',
    { method: 'PUT', body: JSON.stringify({ name, status }) },
    () => localStorageService.updateCandidateStatus(name, status)
  );
}

export async function updateCandidate(id: number, updates: any) {
  return apiFetch(
    `/api/candidates/${id}`,
    { method: 'PUT', body: JSON.stringify(updates) },
    () => localStorageService.updateCandidate(id, updates)
  );
}

// ========== Complaints ==========

export async function getComplaints() {
  return apiFetch(
    '/api/complaints',
    {},
    () => localStorageService.getComplaints()
  );
}

export async function addComplaint(complaint: any) {
  return apiFetch(
    '/api/complaints',
    { method: 'POST', body: JSON.stringify(complaint) },
    () => localStorageService.addComplaint(complaint)
  );
}

export async function updateComplaint(id: string, updates: any) {
  return apiFetch(
    `/api/complaints/${id}`,
    { method: 'PUT', body: JSON.stringify(updates) },
    () => localStorageService.updateComplaint(id, updates)
  );
}

// ========== Feedbacks ==========

export async function getFeedbacks() {
  return apiFetch(
    '/api/feedbacks',
    {},
    () => localStorageService.getFeedbacks()
  );
}

export async function addFeedback(feedback: any) {
  return apiFetch(
    '/api/feedbacks',
    { method: 'POST', body: JSON.stringify(feedback) },
    () => localStorageService.addFeedback(feedback)
  );
}

// ========== AI Config ==========

export async function getAiConfig() {
  return apiFetch(
    '/api/ai-config',
    {},
    () => localStorageService.getAiConfig()
  );
}

export async function updateAiConfig(config: any) {
  return apiFetch(
    '/api/ai-config',
    { method: 'POST', body: JSON.stringify(config) },
    () => localStorageService.updateAiConfig(config)
  );
}

// ========== 工具函数 ==========

/**
 * 页面初始化时调用：检测 API 可用性，输出状态
 */
export async function initApiService(): Promise<{ available: boolean; base: string }> {
  const base = getApiBase();
  const available = await isApiAvailable();
  console.log(
    available
      ? `[API] 云端数据库已连接 (${base})`
      : base
        ? `[API] 云端数据库不可用 (${base})，使用本地存储`
        : `[API] 未配置云端地址，使用本地存储。请在 .env 中设置 VITE_API_BASE_URL 或调用 setApiBase()`
  );
  return { available, base };
}

// 导出状态检查
export { isApiAvailable };
