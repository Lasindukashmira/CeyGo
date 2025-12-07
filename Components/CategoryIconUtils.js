import React from 'react';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';

// Function to get category icon from category name
export const getCategoryIcon = (categoryName, catergoryData) => {
  const iconMap = {
    'Waves': () => <MaterialIcons name="waves" size={12} color="#2c5aa0" />,
    'Mountain': () => <MaterialIcons name="landscape" size={12} color="#2c5aa0" />,
    'FlameKindling': () => <MaterialCommunityIcons name="fire" size={12} color="#2c5aa0" />,
    'Droplets': () => <MaterialCommunityIcons name="water" size={12} color="#2c5aa0" />,
    'Trees': () => <MaterialIcons name="park" size={12} color="#2c5aa0" />,
    'TreePalm': () => <MaterialCommunityIcons name="palm-tree" size={12} color="#2c5aa0" />,
    'Landmark': () => <MaterialIcons name="place" size={12} color="#2c5aa0" />,
    'Church': () => <MaterialCommunityIcons name="church" size={12} color="#2c5aa0" />,
    'Tent': () => <MaterialCommunityIcons name="tent" size={12} color="#2c5aa0" />,
    'Building2': () => <MaterialIcons name="location-city" size={12} color="#2c5aa0" />,
    'Flame': () => <MaterialCommunityIcons name="fire" size={12} color="#2c5aa0" />,
    'Library': () => <MaterialIcons name="local-library" size={12} color="#2c5aa0" />,
  };
  
  const categoryItem = catergoryData.find(cat => cat.title === categoryName);
  const iconName = categoryItem ? categoryItem.icon : 'Waves';
  const IconComponent = iconMap[iconName] || iconMap['Waves'];
  
  return <IconComponent />;
};

