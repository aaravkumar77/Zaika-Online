# 🎨 Zaika Online - Animation & Style Reference

## Pre-built Animations (Tailwind CSS)

### Motion Classes
```tsx
// Fade animations
className="animate-in fade-in duration-300"
className="animate-out fade-out duration-300"

// Slide animations (built-in)
className="animate-in slide-in-from-left duration-300"
className="animate-in slide-in-from-top duration-300"

// Spin animations
className="animate-spin" // 1s rotation
className="animate-pulse" // Opacity pulse

// Custom animations already built:
- translate
- scale
- rotate
```

### Transition Classes
```tsx
// Smooth transitions
className="transition" // 150ms all properties
className="transition-colors" // Only color changes
className="transition-all" // All properties
className="duration-300" // 300ms duration
className="ease-in-out" // Easing function

// Hover effects
className="hover:shadow-lg" // Add shadow
className="hover:scale-105" // Slight zoom
className="hover:bg-[#fff1d5]" // Color change
```

---

## Zaika Color Palette

```tsx
// Primary Colors
#d9472b - Main red (CTAs, highlights)
#251611 - Dark brown (Text, headings)

// Secondary Colors
#fffdf8 - Cream background
#efd9bd - Light beige (borders)
#765f55 - Taupe (secondary text)

// Status Colors
#15803d - Green (veg indicator)
#d97706 - Amber (warning)
#dc2626 - Red (error/non-veg)
```

---

## Ready-to-Use Animation Patterns

### 1. Fade-in on Load
```tsx
<div className="animate-in fade-in duration-300">
  {/* Content fades in smoothly */}
</div>
```

### 2. Smooth Button Hover
```tsx
<button className="transition hover:shadow-md hover:scale-105">
  Click me
</button>
```

### 3. Card Hover Effect
```tsx
<div className="border transition-all hover:border-[#d9472b] hover:shadow-lg">
  Card content
</div>
```

### 4. Spinning Loader
```tsx
<div className="h-8 w-8 rounded-full border-4 border-[#efd9bd] border-t-[#d9472b] animate-spin"></div>
```

### 5. Pulsing Badge
```tsx
<span className="animate-pulse bg-red-500 text-white px-2 py-1 rounded">
  New
</span>
```

### 6. Smooth Color Transition
```tsx
<div className="bg-[#fffdf8] transition-colors hover:bg-[#fff1d5]">
  Hover for color change
</div>
```

### 7. Scale on Hover
```tsx
<img src="url" className="transition transform hover:scale-110" />
```

### 8. Slide Down Animation
```tsx
<div className="animate-in slide-in-from-top duration-300">
  Slides down from top
</div>
```

---

## Component Animation Examples

### Animated List Item
```tsx
<ul className="space-y-3">
  {items.map((item, i) => (
    <li 
      key={item.id}
      className="animate-in fade-in slide-in-from-left duration-300"
      style={{ animationDelay: `${i * 50}ms` }}
    >
      {item.name}
    </li>
  ))}
</ul>
```

### Animated Modal
```tsx
<div className={`
  animate-in fade-in duration-200
  fixed inset-0 bg-black/50
  flex items-center justify-center
`}>
  <div className="animate-in zoom-in duration-200">
    Modal content
  </div>
</div>
```

### Animated Form
```tsx
<form className="space-y-4">
  {fields.map((field, i) => (
    <div
      key={field.id}
      className="animate-in fade-in duration-300"
      style={{ animationDelay: `${i * 100}ms` }}
    >
      <input className="zaika-input" />
    </div>
  ))}
</form>
```

### Staggered Item Animation
```tsx
{restaurants.map((r, i) => (
  <RestaurantCard
    key={r._id}
    restaurant={r}
    className="animate-in fade-in slide-in-from-bottom"
    style={{
      animationDelay: `${i * 100}ms`,
      animationDuration: '400ms',
    }}
  />
))}
```

---

## Advanced Animations

### Bounce In
```tsx
<div className="animate-in bounce-in duration-500">
  Bounces in
</div>
```

### Zoom In
```tsx
<div className="animate-in zoom-in duration-300">
  Zooms in
</div>
```

### Rotate
```tsx
<div className="animate-in rotate-in duration-300">
  Rotates in
</div>
```

---

## Loading States

### Skeleton With Animation
```tsx
<div className="h-20 bg-gradient-to-r from-[#efd9bd] via-[#fff1d5] to-[#efd9bd] animate-pulse rounded-lg" />
```

### Progress Bar
```tsx
<div className="h-1 bg-[#efd9bd] rounded-full overflow-hidden">
  <div className="h-full bg-[#d9472b] animate-pulse" style={{ width: '60%' }} />
</div>
```

### Pulse Dot
```tsx
<div className="inline-flex h-4 w-4 rounded-full bg-green-500 animate-pulse" />
```

---

## Interactive Elements

### Clickable Button with Feedback
```tsx
<button className="
  px-4 py-2 rounded-lg
  bg-[#d9472b] text-white
  transition-all duration-200
  hover:bg-[#c13621]
  hover:shadow-lg
  active:scale-95
  disabled:opacity-50
  disabled:cursor-not-allowed
">
  Click me
</button>
```

### Input Focus Animation
```tsx
<input 
  className="
    border-2 border-[#efd9bd] rounded-lg
    transition-colors duration-200
    focus:border-[#d9472b]
    focus:outline-none
    focus:ring-2
    focus:ring-[#d9472b]
    focus:ring-opacity-20
  "
/>
```

### Dropdown with Animation
```tsx
<div className={`
  absolute top-full left-0 right-0
  bg-white rounded-lg shadow-lg
  animate-in fade-in slide-in-from-top-2 duration-200
  ${isOpen ? '' : 'hidden pointer-events-none'}
`}>
  Menu items
</div>
```

---

## Responsive Animations

### Mobile-First Animation
```tsx
<div className="
  animate-in fade-in duration-300
  md:animate-in md:slide-in-from-left md:duration-500
  lg:animate-in lg:zoom-in lg:duration-700
">
  Different animations per breakpoint
</div>
```

---

## Combining Animations

### Multi-effect Animation
```tsx
<div className="
  animate-in
  fade-in
  slide-in-from-bottom-8
  spin
  duration-700
">
  Multiple effects combined
</div>
```

### Stagger with Delay
```tsx
{items.map((item, i) => (
  <div
    key={item.id}
    className="animate-in fade-in duration-500"
    style={{
      animationDelay: `${i * 150}ms`, // Stagger by 150ms
    }}
  >
    {item.content}
  </div>
))}
```

---

## CSS Custom Animations

### If you need custom animations:
```css
/* In globals.css */
@keyframes slideInFromRight {
  from {
    opacity: 0;
    transform: translateX(100px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@layer utilities {
  .animate-slide-in-right {
    animation: slideInFromRight 0.3s ease-out;
  }
}
```

Then use:
```tsx
<div className="animate-slide-in-right">
  Slides in from right
</div>
```

---

## Performance Tips

### Best Practices
1. ✅ Use `transform` and `opacity` for animations (GPU accelerated)
2. ✅ Avoid animating `width`, `height`, `left`, `top` (causes reflow)
3. ✅ Use `will-change` for expensive animations
4. ✅ Limit concurrent animations
5. ✅ Use `prefers-reduced-motion` for accessibility

### Accessibility
```tsx
<div className="
  animate-in fade-in duration-300
  motion-safe:animate-in
  motion-reduce:animate-none
">
  Respects user preferences
</div>
```

---

## Common Patterns

### Loading State
```tsx
{isLoading ? (
  <div className="animate-pulse bg-[#efd9bd] h-20 rounded-lg" />
) : (
  <div className="animate-in fade-in">{content}</div>
)}
```

### Error Alert
```tsx
<div className="
  border-l-4 border-red-500
  bg-red-50 p-4 rounded
  animate-in shake duration-300
">
  Error message
</div>
```

### Success Toast
```tsx
<div className="
  bg-green-500 text-white p-4 rounded
  shadow-lg
  animate-in slide-in-from-top duration-300
  animate-out fade-out slide-out-to-top duration-200
">
  Success!
</div>
```

---

## Testing Animations

### In Browser DevTools
1. Open DevTools (F12)
2. Go to Rendering tab
3. Check "Disable local fonts" or play with animation speeds
4. Slow down animations with: `animation: calc(var(--time) * 1) !important`

---

## Resources

- [Tailwind CSS Animations](https://tailwindcss.com/docs/animation)
- [Animate.css Alternatives](https://animate.style/)
- [Web Animation Performance](https://web.dev/animations/)

---

**Quick Copy-Paste Ready:**

```tsx
// Fade in on load
className="animate-in fade-in duration-300"

// Hover scale
className="transition hover:scale-105"

// Smooth transition
className="transition-all duration-300 ease-in-out"

// Pulsing loader
className="animate-pulse"

// Spinning loader
className="animate-spin"

// Slide from left
className="animate-in slide-in-from-left duration-500"
```

All animations are built-in. No extra libraries needed! 🎉
