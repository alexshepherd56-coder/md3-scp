# Claude-Inspired Design System

The SCP Cases website has been redesigned with a Claude-inspired aesthetic for a more refined, professional appearance.

## Color Palette

### Primary Colors
- **Cream Background**: `#F4F1EA` - Soft, warm background color
- **Card Background**: `#FDFCFA` - Slightly lighter for cards and containers
- **White Sidebar**: `#FFFFFF` - Clean white for navigation

### Text Colors
- **Primary Text**: `#2B1F15` - Rich, dark brown for high readability
- **Secondary Text**: `#5A4A3F` - Softer brown for secondary information

### Accent Colors
- **Primary Accent**: `#CC785C` - Warm terracotta for buttons, links, active states
- **Accent Hover**: `#B66A4E` - Darker terracotta for hover effects
- **Light Accent**: `#F9EDE6` - Very light peach for subtle backgrounds

### Border Colors
- **Border**: `#E8E3D9` - Soft, warm grey for borders and dividers

## Typography

### Font Stack
```css
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
```

### Font Weights
- **Regular**: 400 (body text)
- **Medium**: 500 (headings, emphasis)
- **Semibold**: 600 (strong emphasis)

### Letter Spacing
- Headings: `-0.02em` to `-0.01em` (tight, modern)
- Sidebar labels: `0.05em` (uppercase tracking)
- Table headers: `0.03em` (uppercase tracking)

## Layout & Spacing

### Main Page
- **Sidebar Width**: 280px
- **Header Height**: 72px
- **Card Grid**: Responsive grid with min 280px columns
- **Card Padding**: 24px
- **Gap Between Cards**: 20px

### Case Pages
- **Max Width**: 840px (optimal reading width)
- **Container Padding**: 48px 56px (desktop)
- **Border**: 1px solid border on left/right for "paper" effect

## Design Features

### Cards
- Subtle border: `1px solid var(--claude-border)`
- Soft shadow: `0 1px 3px rgba(0, 0, 0, 0.04)`
- Hover effect: Lift up 2px with enhanced shadow
- Border radius: 12px

### Buttons
- Terracotta accent color background
- 8px border radius
- Hover: Lift up 1px with shadow
- Smooth transitions (0.2s ease)

### Sidebar Navigation
- Uppercase group labels with letter spacing
- Soft background on hover/active states
- Smooth color transitions
- Active state uses accent color

### Interactive Elements
- Smooth cubic-bezier transitions
- Subtle hover effects (translate, scale, shadow)
- Focus states for accessibility
- Consistent 8-12px border radius

### Scrollbars
- Custom styled: 8px wide
- Accent color on hover
- Rounded 4px

## Key Visual Characteristics

1. **Warm & Welcoming**: Cream and terracotta create an approachable, professional feel
2. **Clean & Spacious**: Generous padding and whitespace
3. **Subtle Depth**: Minimal shadows and borders for hierarchy
4. **Smooth Interactions**: Fluid animations and transitions
5. **High Readability**: Excellent contrast, proper line height (1.7)
6. **Modern Typography**: Tight letter spacing on headings, system font stack

## Accessibility

- **Contrast Ratios**: All text meets WCAG AA standards
- **Focus States**: Clear focus indicators on interactive elements
- **Semantic HTML**: Proper heading hierarchy
- **Responsive**: Mobile-friendly breakpoints

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- CSS Variables for easy theming
- Fallback fonts in stack
- Progressive enhancement approach

## Testing the Design

To see the new design locally:

```bash
cd ~/Desktop/SCPProject
python3 -m http.server 8888
```

Then open: http://localhost:8888/index.html

## Comparison to Previous Design

### Before
- Dark sidebar (#1e1e2f)
- Cool blue accent (#4a6cf7)
- Light grey background (#f7f9fb)
- More saturated colors
- Sharper shadows

### After (Claude-inspired)
- Light sidebar (white)
- Warm terracotta accent (#CC785C)
- Cream background (#F4F1EA)
- Muted, sophisticated palette
- Softer, subtle shadows
- Better visual hierarchy
- More refined typography
