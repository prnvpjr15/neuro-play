# NeuroPlay Theme System - Implementation Guide

## Overview
The NeuroPlay application now features a comprehensive color theme system that allows users to select from multiple pre-designed themes to customize the visual appearance of the dashboard.

## Available Themes

### 1. **Light Mode** (Default)
- **Background**: Light gray (#f8f9fa)
- **Sidebar**: Semi-transparent white
- **Text**: Dark gray
- **Accent**: Blue (#0d6efd)
- **Best for**: Well-lit environments, daytime usage

### 2. **Dark Mode**
- **Background**: Dark gray (#1a1a1a)
- **Sidebar**: Dark gray with opacity
- **Text**: White
- **Accent**: Light blue (#4a9eff)
- **Best for**: Low-light environments, reduced eye strain

### 3. **Ocean Blue**
- **Background**: Light blue (#e8f4f8)
- **Sidebar**: Ocean blue (#0f4d75)
- **Text**: Deep blue
- **Accent**: Bright blue (#0088cc)
- **Best for**: Calming, professional appearance

### 4. **Forest Green**
- **Background**: Light green (#f0f5f0)
- **Sidebar**: Forest green (#225724)
- **Text**: Dark green
- **Accent**: Green (#2d9a3b)
- **Best for**: Natural, soothing environment

### 5. **Sunset Orange**
- **Background**: Light orange (#fef5f0)
- **Sidebar**: Warm orange/brown (#8b3b12)
- **Text**: Dark orange
- **Accent**: Bright orange (#ff6b35)
- **Best for**: Warm, energetic atmosphere

### 6. **Lavender Purple**
- **Background**: Light purple (#f8f6fc)
- **Sidebar**: Deep purple (#582882)
- **Text**: Dark purple
- **Accent**: Lavender (#9966ff)
- **Best for**: Creative, calm environment

### 7. **High Contrast**
- **Background**: Pure white
- **Sidebar**: Pure black
- **Text**: Black
- **Accent**: Bright yellow (#ffff00)
- **Best for**: Users with visual impairments, maximum readability

## Features

### User-Defined Theme Selection
- Users can switch themes by clicking the theme selector buttons in the sidebar
- Theme preference is automatically saved to browser's localStorage
- Theme persists across browser sessions
- Smooth transitions between themes (0.3s animations)

### Theme Selector UI
Located in the sidebar, the theme selector displays:
- 7 circular buttons representing each theme
- Letter abbreviations for quick identification (L=Light, D=Dark, etc.)
- Visual feedback when a theme is selected (highlighted with border)
- Tooltip showing full theme name on hover

### Automatic Color Application
All dashboard elements automatically update when a theme is changed:
- Main background color
- Sidebar background and text
- Navigation links and buttons
- Cards and modals
- Text colors (primary, secondary)
- Border colors
- Accent colors for highlights

## Implementation Details

### Theme Context (`ThemeContext.jsx`)
The theme system is built using React Context API:

```jsx
// Hook to access theme anywhere in the app
const { colors, theme, changeTheme, availableThemes } = useTheme();

// Available properties:
// colors: { bgMain, bgSidebar, bgCard, borderColor, textPrimary, textSecondary, accentColor, hoverBg }
// theme: current theme ID (string)
// changeTheme: function to change theme
// availableThemes: array of available theme objects
```

### File Structure
```
src/
├── ThemeContext.jsx          // Theme context and provider
├── ThemeStyles.css           // Theme-related CSS styles
├── UserDashboard.jsx         // Updated to use theme
├── App.jsx                   // Wrapped with ThemeProvider
└── index.jsx                 // Imports ThemeStyles.css
```

### Storage
Theme preference is saved to localStorage with key: `neuroplay-theme`

## Customization

### Adding a New Theme
To add a custom theme, edit `ThemeContext.jsx`:

```jsx
export const THEMES = {
  // ... existing themes ...
  customTheme: {
    name: "Custom Theme Name",
    bgMain: "#your-color",
    bgSidebar: "rgba(r, g, b, 0.85)",
    bgCard: "#your-color",
    borderColor: "#your-color",
    textPrimary: "#your-color",
    textSecondary: "#your-color",
    accentColor: "#your-color",
    hoverBg: "#your-color",
  },
};
```

### Modifying Existing Theme Colors
Simply update the color values in the THEMES object:

```jsx
light: {
  name: "Light Mode",
  bgMain: "#new-color", // Change background
  accentColor: "#new-color", // Change accent
  // ... other colors
},
```

### Using Theme Colors in Components
In any component within the ThemeProvider:

```jsx
import { useTheme } from './ThemeContext';

function MyComponent() {
  const { colors, theme, changeTheme } = useTheme();
  
  return (
    <div style={{ backgroundColor: colors.bgMain, color: colors.textPrimary }}>
      Current theme: {theme}
    </div>
  );
}
```

## Visual Transitions
All theme changes include smooth CSS transitions:
- Duration: 0.3 seconds
- Easing: ease function
- Affected properties: background-color, color, border-color

These are defined in `ThemeStyles.css`:

```css
* {
  transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease;
}
```

## Accessibility

### High Contrast Mode
- Provides maximum contrast for users with visual impairments
- Uses pure black and white with bright yellow accent
- Recommended for users with color blindness

### Color Blindness Considerations
All themes avoid problematic color combinations:
- No red-green pairs as primary indicators
- Use of text labels alongside colors
- High contrast levels maintained

### Keyboard Navigation
- Theme selector buttons are keyboard accessible
- Tab through theme buttons to select
- Space/Enter to activate

## Browser Support
- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support
- LocalStorage: Required for theme persistence

## Future Enhancements
Potential improvements for future versions:
1. Time-based automatic theme switching (light in day, dark at night)
2. System preference detection (prefers-color-scheme)
3. Custom theme builder UI
4. Per-game theme override options
5. Theme scheduling based on user behavior
6. Collaborative theme sharing between users

## Troubleshooting

### Theme not persisting
- Clear browser cache and localStorage
- Check browser's localStorage settings
- Ensure localStorage is not disabled

### Themes not applying to certain elements
- Check if element is within ThemeProvider
- Verify proper use of inline styles or CSS
- Ensure theme colors object is properly destructured

### Performance issues
- CSS transitions (0.3s) might affect older devices
- Can be disabled by modifying `ThemeStyles.css`

## Support
For issues or feature requests related to themes, please check the application logs and ensure all components are properly wrapped with the ThemeProvider.
