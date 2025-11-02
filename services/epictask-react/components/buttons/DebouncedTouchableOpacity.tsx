import React, { useState, useCallback } from 'react';
import { TouchableOpacity, TouchableOpacityProps, GestureResponderEvent } from 'react-native';

const DebouncedTouchableOpacity: React.FC<TouchableOpacityProps> = ({ onPress, children, ...props }) => {
  const [isNavigating, setIsNavigating] = useState(false);

  const handlePress = useCallback(
    (event: GestureResponderEvent) => {
      if (isNavigating) {
        return;
      }

      setIsNavigating(true);
      if (onPress) {
        onPress(event);
      }

      setTimeout(() => {
        setIsNavigating(false);
      }, 1000); // 1-second debounce delay
    },
    [isNavigating, onPress]
  );

  return (
    <TouchableOpacity onPress={handlePress} disabled={isNavigating} {...props}>
      {children}
    </TouchableOpacity>
  );
};

export default DebouncedTouchableOpacity;
