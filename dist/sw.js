/**
 * Cosmic Typing Adventure - Service Worker
 * オフライン対応とキャッシュ機能
 */

const CACHE_NAME = 'cosmic-typing-v1.0.0';
const STATIC_CACHE = 'cosmic-typing-static-v1.0.0';
const DYNAMIC_CACHE = 'cosmic-typing-dynamic-v1.0.0';

// キャッシュするリソース
const STATIC_RESOURCES = [
  '/',
  '/index.html',
  '/app.html',
  '/css/app.css',
  '/css/common.css',
  '/css/responsive.css',
  '/css/mobile-optimization.css',
  '/js/app.js',
  '/js/common.js',
  '/js/typing-engine.js',
  '/js/supabase-config.js',
  '/js/accessibility-utils.js',
  '/js/ux-utils.js',
  '/data/practice-texts.json',
  '/data/typing-stats.json',
  '/manifest.json',
  '/images/icons/icon-192x192.png',
  '/images/icons/icon-512x512.png'
];

// 動的キャッシュ対象
const DYNAMIC_RESOURCES = [
  'https://cdn.jsdelivr.net/npm/chart.js',
  'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2'
];

// インストール時の処理
self.addEventListener('install', event => {
  console.log('🌌 Service Worker installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => {
        console.log('📦 Caching static resources');
        return cache.addAll(STATIC_RESOURCES);
      })
      .then(() => {
        console.log('✅ Static resources cached successfully');
        return self.skipWaiting();
      })
      .catch(error => {
        console.error('❌ Failed to cache static resources:', error);
      })
  );
});

// アクティベート時の処理
self.addEventListener('activate', event => {
  console.log('🌌 Service Worker activating...');
  
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log('🗑️ Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('✅ Service Worker activated');
        return self.clients.claim();
      })
  );
});

// フェッチ時の処理
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);
  
  // オンライン状態の確認
  const isOnline = navigator.onLine;
  
  // キャッシュ戦略の選択
  if (request.method === 'GET') {
    event.respondWith(handleFetch(request, isOnline));
  }
});

// フェッチ処理の実装
async function handleFetch(request, isOnline) {
  const url = new URL(request.url);
  
  try {
    // 静的リソースの場合
    if (isStaticResource(request)) {
      return await handleStaticResource(request, isOnline);
    }
    
    // 動的リソースの場合
    if (isDynamicResource(request)) {
      return await handleDynamicResource(request, isOnline);
    }
    
    // APIリクエストの場合
    if (isApiRequest(request)) {
      return await handleApiRequest(request, isOnline);
    }
    
    // その他のリクエスト
    return await handleOtherRequest(request, isOnline);
    
  } catch (error) {
    console.error('❌ Fetch error:', error);
    return new Response('Network error', { status: 503 });
  }
}

// 静的リソースの処理
async function handleStaticResource(request, isOnline) {
  const cache = await caches.open(STATIC_CACHE);
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse) {
    // キャッシュから返す
    if (isOnline) {
      // バックグラウンドで更新
      fetch(request).then(response => {
        if (response.ok) {
          cache.put(request, response.clone());
        }
      });
    }
    return cachedResponse;
  }
  
  // オンラインの場合はネットワークから取得
  if (isOnline) {
    try {
      const response = await fetch(request);
      if (response.ok) {
        cache.put(request, response.clone());
      }
      return response;
    } catch (error) {
      return new Response('Offline', { status: 503 });
    }
  }
  
  return new Response('Offline', { status: 503 });
}

// 動的リソースの処理
async function handleDynamicResource(request, isOnline) {
  const cache = await caches.open(DYNAMIC_CACHE);
  const cachedResponse = await cache.match(request);
  
  if (isOnline) {
    try {
      const response = await fetch(request);
      if (response.ok) {
        cache.put(request, response.clone());
      }
      return response;
    } catch (error) {
      if (cachedResponse) {
        return cachedResponse;
      }
      throw error;
    }
  } else {
    if (cachedResponse) {
      return cachedResponse;
    }
    return new Response('Offline', { status: 503 });
  }
}

// APIリクエストの処理
async function handleApiRequest(request, isOnline) {
  if (isOnline) {
    try {
      const response = await fetch(request);
      return response;
    } catch (error) {
      return new Response('API unavailable', { status: 503 });
    }
  } else {
    return new Response('Offline mode', { status: 503 });
  }
}

// その他のリクエストの処理
async function handleOtherRequest(request, isOnline) {
  if (isOnline) {
    try {
      return await fetch(request);
    } catch (error) {
      return new Response('Network error', { status: 503 });
    }
  } else {
    return new Response('Offline', { status: 503 });
  }
}

// 静的リソースかどうかの判定
function isStaticResource(request) {
  const url = new URL(request.url);
  return STATIC_RESOURCES.some(resource => 
    url.pathname === resource || 
    url.pathname.endsWith(resource.split('/').pop())
  );
}

// 動的リソースかどうかの判定
function isDynamicResource(request) {
  const url = new URL(request.url);
  return DYNAMIC_RESOURCES.some(resource => 
    url.href.startsWith(resource)
  );
}

// APIリクエストかどうかの判定
function isApiRequest(request) {
  const url = new URL(request.url);
  return url.pathname.startsWith('/api/') || 
         url.hostname.includes('supabase.co');
}

// メッセージ処理
self.addEventListener('message', event => {
  const { type, data } = event.data;
  
  switch (type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;
      
    case 'GET_CACHE_INFO':
      getCacheInfo().then(info => {
        event.ports[0].postMessage(info);
      });
      break;
      
    case 'CLEAR_CACHE':
      clearCache().then(() => {
        event.ports[0].postMessage({ success: true });
      });
      break;
      
    default:
      console.log('Unknown message type:', type);
  }
});

// キャッシュ情報の取得
async function getCacheInfo() {
  const staticCache = await caches.open(STATIC_CACHE);
  const dynamicCache = await caches.open(DYNAMIC_CACHE);
  
  const staticKeys = await staticCache.keys();
  const dynamicKeys = await dynamicCache.keys();
  
  return {
    staticCacheSize: staticKeys.length,
    dynamicCacheSize: dynamicKeys.length,
    totalSize: staticKeys.length + dynamicKeys.length
  };
}

// キャッシュのクリア
async function clearCache() {
  const cacheNames = await caches.keys();
  await Promise.all(
    cacheNames.map(name => caches.delete(name))
  );
}

// エラーハンドリング
self.addEventListener('error', event => {
  console.error('Service Worker error:', event.error);
});

self.addEventListener('unhandledrejection', event => {
  console.error('Service Worker unhandled rejection:', event.reason);
});

console.log('🌌 Cosmic Typing Adventure Service Worker loaded'); 