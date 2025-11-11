# ANEErrorScreen Component

A reusable error screen component for displaying user-friendly error messages when the Adaptive Narrative Engine (ANE) cannot be reached or other connection issues occur.

## Features

- **Consistent Styling**: Matches the app's design system with proper colors, fonts, and spacing
- **User-Friendly Messages**: Clear, non-technical error messages with helpful troubleshooting tips
- **Customizable**: Flexible props allow for different error scenarios
- **Action Buttons**: Optional retry and go back functionality
- **Visual Feedback**: Large emoji icons with status badges for better visual communication

## Usage

### Basic Usage

```tsx
import ANEErrorScreen from '@/components/common/ANEErrorScreen';
// or
import { ANEErrorScreen } from '@/components/common';

// Minimal usage
<ANEErrorScreen />
```

### With Retry Functionality

```tsx
<ANEErrorScreen
  onRetry={() => refetchData()}
  showGoBack={false}
/>
```

### With Custom Messages

```tsx
<ANEErrorScreen
  title="Stories Unavailable"
  message="We're having trouble loading your learning stories. This might be a connection issue with our story service."
  onRetry={() => refetchStories()}
  onGoBack={() => router.back()}
/>
```

### Full Customization

```tsx
<ANEErrorScreen
  title="Custom Error Title"
  message="Your custom error message here explaining what went wrong."
  onRetry={handleRetry}
  onGoBack={handleGoBack}
  showRetry={true}
  showGoBack={true}
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `onRetry` | `() => void` | `undefined` | Callback function when user taps "Try Again" button |
| `onGoBack` | `() => void` | `undefined` | Callback function when user taps "Go Back" button |
| `title` | `string` | `"Connection Error"` | The main error title displayed to the user |
| `message` | `string` | `"We're having trouble connecting to the story service..."` | Detailed error message explaining the issue |
| `showRetry` | `boolean` | `true` | Whether to show the "Try Again" button |
| `showGoBack` | `boolean` | `true` | Whether to show the "Go Back" button |

## Examples in App

### Stories Screen Error
When the stories list fails to load:
```tsx
if (storiesError) {
  return (
    <ANEErrorScreen
      title="Stories Unavailable"
      message="We're having trouble loading your learning stories. This might be a connection issue with our story service."
      onRetry={() => refetchStories()}
      showGoBack={false}
    />
  );
}
```

### Story Viewer Error
When a specific story fails to load:
```tsx
if (error || !story || !currentNode || !progress) {
  return (
    <ANEErrorScreen
      title="Story Load Failed"
      message={error || "We couldn't load this story. This might be a connection issue with our story service."}
      onRetry={loadStoryData}
      onGoBack={() => router.back()}
    />
  );
}
```

## Design Guidelines

The component follows these design principles:
- Uses the app's color palette (COLORS from `@/constants/Colors`)
- Implements responsive sizing with `react-native-responsive-dimensions`
- Matches the app's typography scale (FONT_SIZES from `@/constants/FontSize`)
- Provides consistent spacing and visual hierarchy
- Uses friendly emoji icons for better visual communication

## Troubleshooting Tips

The component automatically displays the following tips to users:
- Check your internet connection
- Make sure you're connected to WiFi or mobile data
- Try again in a few moments

## Accessibility

- Uses semantic component structure
- Provides clear, actionable button labels
- Includes visual and textual feedback
- Supports touch targets of appropriate size

## Related Components

- `CustomText`: Used for consistent typography
- `SafeAreaView`: Ensures proper display across devices
- Other error/loading screens in the app

## Notes

- The component uses `SafeAreaView` for proper display on devices with notches
- Buttons have proper touch feedback with `activeOpacity={0.7}`
- Shadow effects are implemented for both iOS and Android
- The component is fully typed with TypeScript for better developer experience
