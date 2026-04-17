# Mobile Responsive Bottom Nav — Design Spec

**Date:** 2026-04-17  
**Status:** Approved

---

## Overview

Refactor the admin portal's layout to be mobile responsive. On desktop the existing left sidebar is preserved unchanged. On mobile and tablet screens a fixed bottom navigation bar replaces the sidebar. The scope is minimal: one new component, targeted changes to `AppLayout`, no other files touched.

---

## Breakpoints

| Mode | Condition | Navigation |
|------|-----------|------------|
| Desktop | `>= 1024px` (Ant Design `lg`) | Left sidebar (unchanged) |
| Mobile / Tablet | `< 1024px` | Fixed bottom nav bar |

`AppLayout` derives the mode from Ant Design's `useBreakpoint()` hook (`const isMobile = !screens.lg`). The existing manual `resize` listener and `isMobile` `useState` are removed.

---

## Architecture

### Files changed

| File | Change |
|------|--------|
| `apps/frontend/src/components/layout/AppLayout.tsx` | Replace resize listener with `useBreakpoint`; swap Drawer+hamburger for `<BottomNav />` |
| `apps/frontend/src/components/layout/BottomNav.tsx` | **New file** — bottom nav bar component |

### Files unchanged

- `Sidebar.tsx` — desktop sidebar, untouched
- `Header.tsx` — stays at top on all screen sizes
- `PageHeader.tsx`, `DataTable.tsx`, `FormModal.tsx` — no changes needed

---

## `BottomNav` Component

**File:** `apps/frontend/src/components/layout/BottomNav.tsx`

### Nav items

| Tab | Icon | Action |
|-----|------|--------|
| Dashboard | `DashboardOutlined` | `router.push('/dashboard')` |
| Customers | `TeamOutlined` | `router.push('/customers')` |
| Lenders | `BankOutlined` | `router.push('/lenders')` |
| Loans | `FileTextOutlined` | `router.push('/loans')` |
| Repayments | `DollarOutlined` | `router.push('/repayments')` |
| Admin | `SettingOutlined` | Opens Admin bottom sheet |

### Styling

- Fixed to viewport bottom: `position: fixed; bottom: 0; left: 0; right: 0`
- Height: `60px`
- `z-index: 200`
- Background: `#fff`, top border: `1px solid #f0f0f0`, subtle box shadow
- Each tab: icon on top, label below, evenly spaced (`display: flex; justify-content: space-around`)
- Active tab color: `#1677ff`; inactive: `#8c8c8c`
- Active tab derived from `usePathname()` — same logic as existing `Sidebar`

### Admin bottom sheet

- Ant Design `Drawer` with `placement="bottom"`, height `~140px`
- Two full-width touch-friendly rows: **Users** (`/users`) and **User Groups** (`/user-groups`)
- Each row has icon + label, `padding: 16px`, taps navigate and close the drawer
- Translations via `useTranslations('nav')` — same keys as sidebar

---

## `AppLayout` Changes

1. **Remove** `isMobile` useState, the `resize` `useEffect`, and the hamburger `Button`
2. **Remove** the mobile `Drawer` (left slide-in)
3. **Add** `const screens = useBreakpoint()` and `const isMobile = !screens.lg`
4. **Render** `<BottomNav />` at the bottom of the outer `<Layout>` when `isMobile`
5. **Update** `Content` styles:
   - Desktop: `margin: 24, padding: 24` (unchanged)
   - Mobile: `margin: 12, padding: 16, paddingBottom: 72`

---

## Error Handling & Edge Cases

- Active state on Admin sub-routes (`/users`, `/user-groups`): the Admin tab highlights when `pathname` starts with either `/users` or `/user-groups`
- iOS safe-area: `padding-bottom` of `72px` gives adequate clearance for home indicator on notched devices without requiring `env(safe-area-inset-bottom)` complexity

---

## Out of Scope

- Page-level content refactoring (tables, forms, charts)
- Collapsible sidebar state on desktop
- Any authentication or API changes
