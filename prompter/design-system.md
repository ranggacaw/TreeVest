# Design System

**Status:** Active
**Last Updated:** 2026-03-16

This document defines the design tokens, component patterns, and visual style for the Treevest application. It serves as the source of truth for all UI implementation.

## 1. Brand Concept

- **Core Themes:** Growth, Investment, Nature economy, Financial returns.
- **Tone:** Clean, sustainable, fintech, trustworthy, soft modern UI.

## 2. Colors

### Brand Colors

| Token Name | Hex Value | Usage |
| :--- | :--- | :--- |
| `primary` | <span style="background:#2E9F6B;width:24px;height:24px;display:inline-block;border-radius:4px;vertical-align:middle"></span> `#2E9F6B` | Main brand color |
| `primary-600` | <span style="background:#258A5D;width:24px;height:24px;display:inline-block;border-radius:4px;vertical-align:middle"></span> `#258A5D` | Hover state |
| `primary-700` | <span style="background:#1F7F56;width:24px;height:24px;display:inline-block;border-radius:4px;vertical-align:middle"></span> `#1F7F56` | Active state |
| `primary-100` | <span style="background:#DFF3EA;width:24px;height:24px;display:inline-block;border-radius:4px;vertical-align:middle"></span> `#DFF3EA` | Light background |
| `primary-50` | <span style="background:#F2FBF7;width:24px;height:24px;display:inline-block;border-radius:4px;vertical-align:middle"></span> `#F2FBF7` | Section background |

### Product Colors

| Token Name | Hex Value | Usage |
| :--- | :--- | :--- |
| `durian` | <span style="background:#CFE9DD;width:24px;height:24px;display:inline-block;border-radius:4px;vertical-align:middle"></span> `#CFE9DD` | Durian product theme |
| `alpukat` | <span style="background:#F4E3CF;width:24px;height:24px;display:inline-block;border-radius:4px;vertical-align:middle"></span> `#F4E3CF` | Alpukat product theme |
| `mangga` | <span style="background:#D9E5F5;width:24px;height:24px;display:inline-block;border-radius:4px;vertical-align:middle"></span> `#D9E5F5` | Mangga product theme |
| `lainnya` | <span style="background:#E6E0F3;width:24px;height:24px;display:inline-block;border-radius:4px;vertical-align:middle"></span> `#E6E0F3` | Other products |

### Functional Colors

**Success / Profit**
- `success-50`: <span style="background:#ECFDF5;width:12px;height:12px;display:inline-block;border-radius:2px;vertical-align:middle"></span> `#ECFDF5`
- `success-100`: <span style="background:#D1FAE5;width:12px;height:12px;display:inline-block;border-radius:2px;vertical-align:middle"></span> `#D1FAE5`
- `success-200`: <span style="background:#A7F3D0;width:12px;height:12px;display:inline-block;border-radius:2px;vertical-align:middle"></span> `#A7F3D0`
- `success-300`: <span style="background:#6EE7B7;width:12px;height:12px;display:inline-block;border-radius:2px;vertical-align:middle"></span> `#6EE7B7`
- `success-400`: <span style="background:#34D399;width:12px;height:12px;display:inline-block;border-radius:2px;vertical-align:middle"></span> `#34D399`
- `success-500`: <span style="background:#2DBE78;width:12px;height:12px;display:inline-block;border-radius:2px;vertical-align:middle"></span> `#2DBE78`
- `success-600`: <span style="background:#059669;width:12px;height:12px;display:inline-block;border-radius:2px;vertical-align:middle"></span> `#059669`
- `success-700`: <span style="background:#047857;width:12px;height:12px;display:inline-block;border-radius:2px;vertical-align:middle"></span> `#047857`

**Warning**
- `warning-50`: <span style="background:#FFF7ED;width:12px;height:12px;display:inline-block;border-radius:2px;vertical-align:middle"></span> `#FFF7ED`
- `warning-100`: <span style="background:#FFEDD5;width:12px;height:12px;display:inline-block;border-radius:2px;vertical-align:middle"></span> `#FFEDD5`
- `warning-200`: <span style="background:#FED7AA;width:12px;height:12px;display:inline-block;border-radius:2px;vertical-align:middle"></span> `#FED7AA`
- `warning-300`: <span style="background:#FDBA74;width:12px;height:12px;display:inline-block;border-radius:2px;vertical-align:middle"></span> `#FDBA74`
- `warning-400`: <span style="background:#FB923C;width:12px;height:12px;display:inline-block;border-radius:2px;vertical-align:middle"></span> `#FB923C`
- `warning-500`: <span style="background:#FF8A4C;width:12px;height:12px;display:inline-block;border-radius:2px;vertical-align:middle"></span> `#FF8A4C`
- `warning-600`: <span style="background:#EA580C;width:12px;height:12px;display:inline-block;border-radius:2px;vertical-align:middle"></span> `#EA580C`

**Danger**
- `danger-50`: <span style="background:#FEF2F2;width:12px;height:12px;display:inline-block;border-radius:2px;vertical-align:middle"></span> `#FEF2F2`
- `danger-100`: <span style="background:#FEE2E2;width:12px;height:12px;display:inline-block;border-radius:2px;vertical-align:middle"></span> `#FEE2E2`
- `danger-200`: <span style="background:#FECACA;width:12px;height:12px;display:inline-block;border-radius:2px;vertical-align:middle"></span> `#FECACA`
- `danger-300`: <span style="background:#FCA5A5;width:12px;height:12px;display:inline-block;border-radius:2px;vertical-align:middle"></span> `#FCA5A5`
- `danger-400`: <span style="background:#F87171;width:12px;height:12px;display:inline-block;border-radius:2px;vertical-align:middle"></span> `#F87171`
- `danger-500`: <span style="background:#FF5A5A;width:12px;height:12px;display:inline-block;border-radius:2px;vertical-align:middle"></span> `#FF5A5A`
- `danger-600`: <span style="background:#DC2626;width:12px;height:12px;display:inline-block;border-radius:2px;vertical-align:middle"></span> `#DC2626`

**Neutral (Gray)**
- `gray-50`: <span style="background:#F9FAFB;width:12px;height:12px;display:inline-block;border-radius:2px;vertical-align:middle"></span> `#F9FAFB`
- `gray-100`: <span style="background:#F3F4F6;width:12px;height:12px;display:inline-block;border-radius:2px;vertical-align:middle"></span> `#F3F4F6`
- `gray-200`: <span style="background:#E5E7EB;width:12px;height:12px;display:inline-block;border-radius:2px;vertical-align:middle"></span> `#E5E7EB`
- `gray-300`: <span style="background:#D1D5DB;width:12px;height:12px;display:inline-block;border-radius:2px;vertical-align:middle"></span> `#D1D5DB`
- `gray-400`: <span style="background:#9CA3AF;width:12px;height:12px;display:inline-block;border-radius:2px;vertical-align:middle"></span> `#9CA3AF`
- `gray-500`: <span style="background:#6B7280;width:12px;height:12px;display:inline-block;border-radius:2px;vertical-align:middle"></span> `#6B7280`
- `gray-600`: <span style="background:#4B5563;width:12px;height:12px;display:inline-block;border-radius:2px;vertical-align:middle"></span> `#4B5563`
- `gray-700`: <span style="background:#374151;width:12px;height:12px;display:inline-block;border-radius:2px;vertical-align:middle"></span> `#374151`
- `gray-800`: <span style="background:#1F2937;width:12px;height:12px;display:inline-block;border-radius:2px;vertical-align:middle"></span> `#1F2937`
- `gray-900`: <span style="background:#111827;width:12px;height:12px;display:inline-block;border-radius:2px;vertical-align:middle"></span> `#111827`

### Gradients

- **Investment Card:** `linear-gradient(135deg, #E6F5EE, #CFE9DD)`
- **Upgrade Card:** `linear-gradient(135deg, #E9EDFF, #DDE4FF)`

## 3. Typography

**Font Family:** Inter (primary), Poppins (alternative)

| Element | Size | Weight |
| :--- | :--- | :--- |
| Portfolio Value | 28px | 700 (Bold) |
| Section Title | 16px | 600 (SemiBold) |
| Card Title | 15px | 600 (SemiBold) |
| Body | 14px | 400 (Regular) |
| Caption | 12px | 500 (Medium) |

## 4. Spacing

Base unit: **8px**

| Token | Value |
| :--- | :--- |
| `xs` | 4px |
| `sm` | 8px |
| `md` | 16px |
| `lg` | 24px |
| `xl` | 32px |
| `2xl` | 40px |

## 5. Border Radius

| Token | Value |
| :--- | :--- |
| `sm` | 8px |
| `md` | 12px |
| `lg` | 16px |
| `xl` | 20px |
| `full` | 999px |

## 6. Shadows

- **Card:** `0 4px 12px rgba(0,0,0,0.05)`
- **Floating Button:** `0 10px 24px rgba(46,159,107,0.25)`

## 7. Icons

- **Sets:** Lucide (recommended), Heroicons, Phosphor
- **Style:** 2px stroke, rounded

## 8. Tailwind Configuration

Use this theme extension in `tailwind.config.js`:

```javascript
theme: {
  extend: {
    colors: {
      primary: "#2E9F6B",
      primaryDark: "#1F7F56",
      durian: "#CFE9DD",
      alpukat: "#F4E3CF",
      mangga: "#D9E5F5",
      lainnya: "#E6E0F3",
      success: "#2DBE78",
      warning: "#FF8A4C",
      danger: "#FF5A5A",
      bg: "#F6F8F7",
      card: "#FFFFFF",
      border: "#E7ECEA",
      text: "#1F2D2A",
      textSecondary: "#7B8A87"
    },
    borderRadius: {
      card: "16px"
    }
  }
}
```

## 9. Components

### Primary Button
```jsx
export default function ButtonPrimary({children}) {
  return (
    <button className="bg-primary text-white px-5 py-2 rounded-full hover:bg-primaryDark transition shadow-sm active:scale-95">
      {children}
    </button>
  )
}
```

### Secondary Button
```jsx
<button className="border border-primary text-primary px-5 py-2 rounded-full hover:bg-primary/10 transition active:scale-95">
  {children}
</button>
```

### Investment Card
```jsx
<div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:-translate-y-1 transition-transform duration-200">
  <h3 className="font-semibold text-gray-900">Musim Panen Mango Alphonso</h3>
  <p className="text-sm text-gray-500 mt-1">Estimasi panen 13 hari lagi</p>
  <button className="mt-3 border border-primary text-primary px-4 py-1 rounded-full text-sm">
    Beli Ekstra
  </button>
</div>
```

### Floating Action Button
```jsx
<button className="fixed bottom-20 right-6 w-14 h-14 rounded-full bg-primary text-white shadow-lg flex items-center justify-center hover:bg-primaryDark transition-colors active:scale-95">
  <PlusIcon className="w-6 h-6" />
</button>
```

## 10. Landing Page Layout

- **Hero:** Headline, Investment illustration, CTA buttons, Stats. Background: `primary-50`.
- **Products:** Grid of 4 cards (Durian, Mangga, Alpukat, Others).
- **How It Works:** 3 steps (Choose Trees, Invest, Harvest Profit).
- **ROI Example:** Invest Rp 1.000.000 → Potential ROI 15.5% → Harvest in 13 days.
- **Trust:** Stats on investors, farms, trees planted.
