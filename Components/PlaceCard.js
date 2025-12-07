import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const PlaceCard = ({ item, onPress, getCategoryIcon, rank, navigation }) => {
  const [isFavorited, setIsFavorited] = useState(false);

  const handleFavoritePress = (event) => {
    event.stopPropagation(); // Prevent card press when heart is pressed
    setIsFavorited(!isFavorited);
    console.log(`${isFavorited ? 'Removed from' : 'Added to'} favorites:`, item.name);
  };

  const handleCardPress = () => {
    if (navigation) {
      navigation.navigate('PlaceDetails', { place: item });
    } else if (onPress) {
      onPress(item);
    }
  };

  return (
    <TouchableOpacity style={styles.placeCard} onPress={handleCardPress}>
      {/* Place Image */}
      <View style={styles.placeImageContainer}>
        <Image 
          source={{ uri: item.image_urls[0] }} 
          style={styles.placeImage} 
          defaultSource={require('../assets/cpic/History.jpg')}
        />
        <View style={styles.placeRankBadge}>
          <Text style={styles.placeRankText}>#{rank}</Text>
        </View>
        <View style={styles.placeRatingContainer}>
          <Text style={styles.placeRatingText}>⭐ {item.rating}</Text>
        </View>
        
        {/* Favorite Button */}
        <TouchableOpacity style={styles.favoriteButton} onPress={handleFavoritePress}>
          <MaterialIcons 
            name={isFavorited ? "favorite" : "favorite-border"} 
            size={24} 
            color={isFavorited ? "#e74c3c" : "#fff"} 
          />
        </TouchableOpacity>
        
        {/* Category Icons Overlay */}
        <View style={styles.placeCategoriesOverlay}>
          {item.category.slice(0, 3).map((categoryName, index) => (
            <View key={index} style={styles.placeCategoryBadge}>
              {getCategoryIcon(categoryName)}
            </View>
          ))}
          {item.category.length > 3 && (
            <View style={styles.placeCategoryBadge}>
              <Text style={styles.placeCategoryMoreText}>+{item.category.length - 3}</Text>
            </View>
          )}
        </View>
      </View>

      {/* Place Info */}
      <View style={styles.placeInfo}>
        <Text style={styles.placeName} numberOfLines={2}>{item.name}</Text>
        
        {/* Location */}
        <View style={styles.placeMetaInfo}>
          <View style={styles.placeLocationContainer}>
            <MaterialIcons name="location-on" size={14} color="#666" style={styles.placeLocationIcon} />
            <Text style={styles.placeLocationText} numberOfLines={1}>
              {item.geolocation.district}, {item.geolocation.province}
            </Text>
          </View>
        </View>

        {/* Reviews and Popularity */}
        <View style={styles.placeStats}>
          <View style={styles.placeStatItem}>
            <MaterialIcons name="visibility" size={14} color="#666" style={styles.placeStatIcon} />
            <Text style={styles.placeStatText}>
              {(item.popularity_score * 1000).toFixed(0)} views
            </Text>
          </View>
          <View style={styles.placeStatItem}>
            <MaterialIcons name="comment" size={14} color="#666" style={styles.placeStatIcon} />
            <Text style={styles.placeStatText}>
              {(item.popularity_score * 150).toFixed(0)} reviews
            </Text>
          </View>
        </View>

        {/* Description Preview */}
        <Text style={styles.placeDescription} numberOfLines={2}>
          {item.description}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  placeCard: {
    width: 280,
    marginRight: 15,
    borderRadius: 20,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  placeImageContainer: {
    position: 'relative',
    height: 180,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  placeCategoriesOverlay: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  placeCategoryBadge: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 12,
    marginRight: 6,
    borderWidth: 0.5,
    borderColor: 'rgba(44, 90, 160, 0.2)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  placeImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  placeRankBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: '#2c5aa0',
    borderRadius: 15,
    paddingHorizontal: 8,
    paddingVertical: 4,
    minWidth: 30,
    alignItems: 'center',
  },
  placeRankText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  placeRatingContainer: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 15,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  placeRatingText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  favoriteButton: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeInfo: {
    padding: 16,
  },
  placeName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    lineHeight: 22,
  },
  placeMetaInfo: {
    marginBottom: 12,
  },
  placeCategoryMoreText: {
    fontSize: 9,
    color: '#2c5aa0',
    fontWeight: 'bold',
  },
  placeLocationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  placeLocationIcon: {
    marginRight: 6,
  },
  placeLocationText: {
    fontSize: 12,
    color: '#666',
    flex: 1,
  },
  placeStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
  },
  placeStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  placeStatIcon: {
    marginRight: 4,
  },
  placeStatText: {
    fontSize: 11,
    color: '#666',
    fontWeight: '500',
  },
  placeDescription: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
});

export default PlaceCard;
