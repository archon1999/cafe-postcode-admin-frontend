# Admin Frontend

`admin-frontend` ushbu backend uchun Minimal MUI Template asosida qurilgan admin paneldir. Loyihada faqat admin auth va users moduli qoldirilgan, qolgan eski biznes modullar olib tashlangan.

## Stack
- React 19 + TypeScript
- Vite
- MUI
- TanStack Query
- Zustand
- React Hook Form + Zod
- i18next

## Tillar
- `uz`
- `uz-Cyrl`
- `ru`

Default til: `uz`

## Asosiy route'lar
- `/auth/login`
- `/users`
- `/users/add`
- `/users/:id`
- `/users/:id/edit`

## Backend contract
- Login: `/api/v1/admin/auth/login/`
- Me: `/api/v1/admin/auth/me/`
- Logout: `/api/v1/admin/auth/logout/`
- Users: `/api/v1/admin/users/`
- Roles: `/api/v1/admin/users/roles/`

Auth header formati:

```http
Authorization: Token <token>
```

## Lokal ishga tushirish

```bash
npm install
npm run dev
```

Default dev proxy:

```env
VITE_DEV_PROXY_TARGET=http://127.0.0.1:8000
```

## Build

```bash
npm run build
```
