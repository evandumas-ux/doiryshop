---
name: conversion-rate-optimizer
description: Strategic optimization of e-commerce checkout funnels and conversion paths. Use when Gemini CLI needs to audit or implement features that increase revenue per visitor, reduce friction, or enhance trust in a luxury or premium brand context.
---

# Conversion Rate Optimizer (CRO)

Expert guidance for maximizing conversion rates while maintaining a high-end brand aesthetic.

## Principles

1. **Friction Reduction**: Minimize the number of steps and cognitive load required to complete a purchase.
2. **Visual Trust**: Use glassmorphism, high-quality typography, and subtle micro-interactions to build luxury authority.
3. **Strategic Incentivization**: Use dynamic thresholds and cross-sells to increase Average Order Value (AOV).
4. **Reassurance Everywhere**: Place security and delivery guarantees near all high-friction points (Add to Cart, Checkout buttons).

## Workflows

### 1. Cart Audit & Optimization
- **Trigger**: When the user wants to improve the cart experience.
- **Action**: 
    - Convert standard cart pages to slide-out drawers.
    - Implement glassmorphic overlays (`backdrop-blur`).
    - Add real-time shipping threshold calculations.
    - Integrate "one-click" quantity adjustments.

### 2. Checkout Streamlining
- **Trigger**: When the checkout abandonment rate is high or the flow feels clunky.
- **Action**:
    - Implement multi-step forms with clear progress indicators.
    - Add express checkout skeletons (Apple Pay, Google Pay) to the first step.
    - Inline validation for all fields to prevent submit-time frustration.

### 3. Trust Architecture
- **Trigger**: When adding new products or landing pages.
- **Action**:
    - Add minimalist reassurance bullet points (neutral-400 tone) beneath CTA buttons.
    - Display verified purchase testimonials strategically.
    - Ensure SSL and secure payment badges are visible but non-distracting.

## Component Templates

### Reassurance Micro-copy
```jsx
<div className="mt-4 flex flex-col gap-2 text-neutral-400 text-sm">
  <div className="flex items-center gap-2">
    <ShieldCheck size={16} />
    <span>Paiement 100% Sécurisé</span>
  </div>
  {/* ... */}
</div>
```

### Glassmorphic Drawer
```jsx
<motion.div 
  className="bg-white/10 backdrop-blur-xl border-l border-white/20 shadow-2xl"
  {/* ... */}
/>
```
