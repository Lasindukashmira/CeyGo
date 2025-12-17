import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Modal,
  Dimensions,
  Image,
  TextInput,
  ScrollView,
  Platform,
  StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { Calendar } from 'react-native-calendars';
import { LinearGradient } from 'expo-linear-gradient'; // Premium Gradients
import LoadingScreen from '../Components/LoadingScreen';
import { districs } from '../constData';

const { width, height } = Dimensions.get('window');

// Premium Color Palette
const COLORS = {
  primary: '#2c5aa0',
  primaryDark: '#1a3b70', // For gradients
  gold: '#FFD700',
  goldDark: '#FDB813', // For gradients
  background: '#F8F9FB',
  textDark: '#1A1A1A',
  textLight: '#757575',
  white: '#FFFFFF',
  error: '#FF5252',
  success: '#4CAF50'
};

const TourismPlanScreen = ({ navigation }) => {
  // --- State ---
  const [plans, setPlans] = useState([]);
  const [isWizardOpen, setWizardOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Wizard Data
  const [step, setStep] = useState(1);
  const [tripData, setTripData] = useState({
    destination: '',
    isSurprise: false,
    duration: 0,
    startDate: '',
    endDate: '',
    travelers: 'Couple',
    budget: 'Standard',
    interests: []
  });

  const [markedDates, setMarkedDates] = useState({});
  const [isDistrictModalVisible, setDistrictModalVisible] = useState(false);
  const [districtSearch, setDistrictSearch] = useState("");

  // --- Constants ---
  const travelerTypes = [
    { id: 'Solo', icon: 'user', label: 'Solo Traveler' },
    { id: 'Couple', icon: 'user-friends', label: 'Couple' },
    { id: 'Family', icon: 'users', label: 'Family' },
    { id: 'Friends', icon: 'glass-cheers', label: 'Friends' },
  ];

  const budgetTypes = [
    { id: 'Economy', icon: 'piggy-bank', label: 'Economy', desc: 'Budget-friendly' },
    { id: 'Standard', icon: 'wallet', label: 'Standard', desc: 'Balanced comfort' },
    { id: 'Luxury', icon: 'crown', label: 'Luxury', desc: 'Top-tier indulgence' },
  ];

  const interestOptions = [
    { id: 'Beaches', icon: 'umbrella-beach' },
    { id: 'Culture', icon: 'monument' },
    { id: 'Nature', icon: 'leaf' },
    { id: 'Wildlife', icon: 'paw' },
    { id: 'Adventure', icon: 'hiking' },
    { id: 'Food', icon: 'utensils' },
    { id: 'Wellness', icon: 'spa' },
    { id: 'Shopping', icon: 'shopping-bag' },
  ];

  // --- Handlers ---
  const handleStartWizard = () => {
    setStep(1);
    setTripData({
      destination: '',
      isSurprise: false,
      duration: 0,
      startDate: '',
      endDate: '',
      travelers: 'Couple',
      budget: 'Standard',
      interests: []
    });
    setMarkedDates({});
    setWizardOpen(true);
  };

  const updateData = (key, value) => {
    setTripData(prev => ({ ...prev, [key]: value }));
  };

  const onDayPress = (day) => {
    const date = day.dateString;
    let newMarked = {};
    let start = tripData.startDate;
    let end = tripData.endDate;

    if (!start || (start && end)) {
      start = date;
      end = "";
      newMarked = {
        [date]: { startingDay: true, color: COLORS.primary, textColor: 'white' }
      };
    } else {
      if (date < start) {
        start = date;
        end = tripData.startDate;
      } else {
        end = date;
      }

      let currentDate = new Date(start);
      const loopEnd = new Date(end);

      while (currentDate <= loopEnd) {
        const dateStr = currentDate.toISOString().split('T')[0];
        if (dateStr === start) {
          newMarked[dateStr] = { startingDay: true, color: COLORS.primary, textColor: 'white' };
        } else if (dateStr === end) {
          newMarked[dateStr] = { endingDay: true, color: COLORS.primary, textColor: 'white' };
        } else {
          newMarked[dateStr] = { color: '#e3f2fd', textColor: COLORS.primary };
        }
        currentDate.setDate(currentDate.getDate() + 1);
      }
    }

    let days = 0;
    if (start && end) {
      const diffTime = Math.abs(new Date(end) - new Date(start));
      days = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    }

    setTripData(prev => ({ ...prev, startDate: start, endDate: end, duration: days }));
    setMarkedDates(newMarked);
  };

  const toggleInterest = (id) => {
    setTripData(prev => {
      const current = prev.interests;
      if (current.includes(id)) {
        return { ...prev, interests: current.filter(i => i !== id) };
      } else {
        return { ...prev, interests: [...current, id] };
      }
    });
  };

  const handleNext = () => {
    if (tripData.isSurprise || tripData.destination) {
      if (step === 1 && tripData.duration <= 0) return;
      if (step < 3) setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleGenerate = () => {
    setWizardOpen(false);
    setLoading(true);

    setTimeout(() => {
      const newPlan = {
        id: Date.now().toString(),
        title: tripData.isSurprise ? "Surprise Adventure" : `Unknown Trip`, // Fallback for logic
        displayTitle: tripData.isSurprise ? "Surprise Adventure" : `${tripData.destination} Escape`,
        subtitle: `${tripData.duration} Days • ${tripData.travelers}`,
        dates: `${tripData.startDate} - ${tripData.endDate}`,
        image: tripData.destination
          ? (districs.find(d => d.name === tripData.destination)?.image || "https://images.unsplash.com/photo-1586619782390-50d4d8fc38b3")
          : "https://images.unsplash.com/photo-1546708773-e578c7bd5f68?q=80&w=2070", // Surprise generic
        createdAt: new Date(),
        budget: tripData.budget
      };
      setPlans(prev => [newPlan, ...prev]);
      setLoading(false);
    }, 4000);
  };

  // --- Renderers ---

  const renderHeader = () => (
    <View style={styles.header}>
      <View>
        <Text style={styles.headerTitle}>AI Trip Planner</Text>
        <Text style={styles.headerSubtitle}>Craft your perfect Sri Lankan journey</Text>
      </View>
      <TouchableOpacity style={styles.historyBtn}>
        <MaterialCommunityIcons name="history" size={24} color={COLORS.primary} />
      </TouchableOpacity>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Image
        source={{ uri: 'https://cdn-icons-png.flaticon.com/512/7486/7486252.png' }}
        style={styles.emptyImage}
      />
      <Text style={styles.emptyTitle}>Your Adventure Awaits</Text>
      <Text style={styles.emptyText}>
        Our AI can build a personalized itinerary just for you in seconds.
      </Text>
      <TouchableOpacity onPress={handleStartWizard} activeOpacity={0.8}>
        <LinearGradient
          colors={[COLORS.primary, COLORS.primaryDark]}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={styles.createBtnGradient}
        >
          <MaterialCommunityIcons name="sparkles" size={22} color="#fff" />
          <Text style={styles.createBtnText}>Plan a New Trip</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  const renderPlanItem = ({ item }) => (
    <TouchableOpacity style={styles.planCard} activeOpacity={0.9}>
      <Image source={typeof item.image === 'number' ? item.image : { uri: item.image }} style={styles.planImage} />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.8)']}
        style={styles.planOverlay}
      >
        <View style={styles.planTopRow}>
          <View style={styles.planBadge}>
            <Text style={styles.planBadgeText}>AI PLAN</Text>
          </View>
          <View style={[styles.planBadge, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
            <Text style={[styles.planBadgeText, { color: '#fff' }]}>{item.budget}</Text>
          </View>
        </View>

        <View>
          <Text style={styles.planTitle}>{item.displayTitle}</Text>
          <View style={styles.planMetaRow}>
            <MaterialIcons name="calendar-today" size={14} color="#ddd" />
            <Text style={styles.planSubtitle}>{item.dates} ({parseInt(item.subtitle)} Days)</Text>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  // --- Wizard Steps ---

  const renderStepIcon = (icon) => (
    <View style={styles.stepIconContainer}>
      <FontAwesome5 name={icon} size={20} color={COLORS.primary} />
    </View>
  );

  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      <View style={styles.stepHeader}>
        {renderStepIcon("map-marked-alt")}
        <View>
          <Text style={styles.stepTitle}>Where & When?</Text>
          <Text style={styles.stepSubtitle}>Select your destination and dates.</Text>
        </View>
      </View>

      <Text style={styles.label}>Choose Destination</Text>
      <View style={styles.destinationToggleRow}>
        <TouchableOpacity
          activeOpacity={0.8}
          style={[styles.surpriseBtnContainer, tripData.isSurprise && styles.surpriseBtnActiveShadow]}
          onPress={() => updateData('isSurprise', !tripData.isSurprise)}
        >
          {tripData.isSurprise ? (
            <LinearGradient
              colors={[COLORS.gold, COLORS.goldDark]}
              style={styles.surpriseBtnGradient}
            >
              <MaterialCommunityIcons name="dice-3" size={24} color="#FFF" />
              <Text style={[styles.surpriseBtnText, { color: '#FFF' }]}>Surprise Me!</Text>
            </LinearGradient>
          ) : (
            <View style={styles.surpriseBtnPlain}>
              <MaterialCommunityIcons name="dice-3" size={24} color={COLORS.goldDark} />
              <Text style={styles.surpriseBtnText}>Surprise Me!</Text>
            </View>
          )}
        </TouchableOpacity>

        <Text style={styles.orText}>— OR —</Text>

        <TouchableOpacity
          style={[styles.selectInput, tripData.isSurprise && styles.disabledInput]}
          onPress={() => !tripData.isSurprise && setDistrictModalVisible(true)}
          disabled={tripData.isSurprise}
        >
          <View style={styles.inputLeft}>
            <MaterialIcons name="place" size={22} color={tripData.isSurprise ? "#ccc" : COLORS.primary} />
            <Text style={[styles.selectInputText, tripData.isSurprise && styles.disabledInputText, !tripData.destination && styles.placeholderText]}>
              {tripData.destination || "Select District"}
            </Text>
          </View>
          <MaterialIcons name="arrow-drop-down" size={24} color={tripData.isSurprise ? "#ccc" : "#666"} />
        </TouchableOpacity>
      </View>

      <Text style={[styles.label, { marginTop: 25 }]}>
        Select Dates
        {tripData.duration > 0 && <Text style={styles.durationHighlight}> • {tripData.duration} Days</Text>}
      </Text>
      <View style={styles.calendarContainer}>
        <Calendar
          markingType={'period'}
          markedDates={markedDates}
          onDayPress={onDayPress}
          theme={{
            calendarBackground: '#ffffff',
            textSectionTitleColor: '#b6c1cd',
            selectedDayBackgroundColor: COLORS.primary,
            selectedDayTextColor: '#ffffff',
            todayTextColor: COLORS.primary,
            dayTextColor: '#2d4150',
            textDisabledColor: '#d9e1e8',
            dotColor: COLORS.primary,
            selectedDotColor: '#ffffff',
            arrowColor: COLORS.primary,
            monthTextColor: COLORS.textDark,
            indicatorColor: COLORS.primary,
            textDayFontWeight: '600',
            textMonthFontWeight: 'bold',
            textDayHeaderFontWeight: '600',
            textDayFontSize: 14,
            textMonthFontSize: 16,
            textDayHeaderFontSize: 13
          }}
        />
      </View>

      {/* Modal Re-implementation omitted for brevity in snippet but kept in full file below */}
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContainer}>
      <View style={styles.stepHeader}>
        {renderStepIcon("user-cog")}
        <View>
          <Text style={styles.stepTitle}>Travel Style</Text>
          <Text style={styles.stepSubtitle}>Who are you traveling with?</Text>
        </View>
      </View>

      <Text style={styles.label}>Travelers</Text>
      <View style={styles.grid}>
        {travelerTypes.map(t => (
          <TouchableOpacity
            key={t.id}
            activeOpacity={0.8}
            onPress={() => updateData('travelers', t.id)}
            style={{ width: '48%', marginBottom: 15 }}
          >
            <View style={[styles.choiceCard, tripData.travelers === t.id && styles.choiceCardActive]}>
              <View style={[styles.iconCircle, tripData.travelers === t.id && styles.iconCircleActive]}>
                <FontAwesome5 name={t.icon} size={18} color={tripData.travelers === t.id ? '#fff' : COLORS.textLight} />
              </View>
              <Text style={[styles.choiceLabel, tripData.travelers === t.id && styles.choiceLabelActive]}>{t.label}</Text>
              {tripData.travelers === t.id && (
                <View style={styles.checkedBadge}>
                  <MaterialIcons name="check" size={12} color="#fff" />
                </View>
              )}
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={[styles.label, { marginTop: 10 }]}>Budget</Text>
      <View style={styles.grid}>
        {budgetTypes.map(b => (
          <TouchableOpacity
            key={b.id}
            activeOpacity={0.8}
            onPress={() => updateData('budget', b.id)}
            style={{ width: '100%', marginBottom: 12 }}
          >
            <View style={[styles.budgetCard, tripData.budget === b.id && styles.budgetCardActive]}>
              <View style={[styles.budgetIconBox, tripData.budget === b.id && styles.budgetIconBoxActive]}>
                <FontAwesome5 name={b.icon} size={18} color={tripData.budget === b.id ? '#fff' : COLORS.textLight} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.choiceLabel, tripData.budget === b.id && styles.choiceLabelActive]}>{b.label}</Text>
                <Text style={styles.budgetDesc}>{b.desc}</Text>
              </View>
              {tripData.budget === b.id && <MaterialIcons name="check-circle" size={24} color={COLORS.primary} />}
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContainer}>
      <View style={styles.stepHeader}>
        {renderStepIcon("heart")}
        <View>
          <Text style={styles.stepTitle}>Interests</Text>
          <Text style={styles.stepSubtitle}>What do you love?</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={{ marginBottom: 20 }}>
        <View style={styles.chipsContainer}>
          {interestOptions.map(i => {
            const selected = tripData.interests.includes(i.id);
            return (
              <TouchableOpacity
                key={i.id}
                activeOpacity={0.7}
                style={[styles.interestChip, selected && styles.interestChipActive]}
                onPress={() => toggleInterest(i.id)}
              >
                {selected && <LinearGradient colors={[COLORS.gold, COLORS.goldDark]} style={StyleSheet.absoluteFillObject} />}

                <FontAwesome5 name={i.icon} size={14} color={selected ? '#333' : COLORS.primary} style={{ zIndex: 1 }} />
                <Text style={[styles.interestLabel, selected && styles.interestLabelActive, { zIndex: 1 }]}>{i.id}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      {renderHeader()}

      {plans.length === 0 ? renderEmptyState() : (
        <FlatList
          data={plans}
          renderItem={renderPlanItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={() => (
            <TouchableOpacity style={styles.fabBtn} onPress={handleStartWizard} activeOpacity={0.8}>
              <LinearGradient
                colors={[COLORS.primary, COLORS.primaryDark]}
                style={styles.fabGradient}
              >
                <MaterialIcons name="add" size={30} color="#fff" />
              </LinearGradient>
            </TouchableOpacity>
          )}
        />
      )}

      {/* Loading Overlay */}
      <Modal visible={loading} animationType="fade" transparent={false}>
        <LoadingScreen message="AI is crafting your itinerary..." />
      </Modal>

      {/* Wizard Modal */}
      <Modal visible={isWizardOpen} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setWizardOpen(false)} style={styles.closeBtn}>
              <MaterialIcons name="close" size={22} color={COLORS.textDark} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Trip Wizard</Text>
            <Text style={[styles.stepIndicator, { color: COLORS.primary }]}>{step}/3</Text>
          </View>

          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBarInfo, { width: `${(step / 3) * 100}%`, backgroundColor: COLORS.primary }]} />
          </View>

          <ScrollView contentContainerStyle={styles.modalContent}>
            {step === 1 && renderStep1()}
            {step === 2 && renderStep2()}
            {step === 3 && renderStep3()}
          </ScrollView>

          <View style={styles.modalFooter}>
            {step > 1 ? (
              <TouchableOpacity style={styles.backBtn} onPress={handleBack}>
                <Text style={styles.backBtnText}>Back</Text>
              </TouchableOpacity>
            ) : (
              <View /> /* Empty view to keep space-between working if needed, or remove to align Left */
            )}

            {step < 3 ? (
              <TouchableOpacity onPress={handleNext} activeOpacity={0.8} style={step === 1 && { marginLeft: 'auto' }}>
                <LinearGradient
                  colors={[COLORS.primary, COLORS.primaryDark]}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                  style={styles.nextBtnGradient}
                >
                  <Text style={styles.nextBtnText}>Next Step</Text>
                  <MaterialIcons name="arrow-forward" size={18} color="#fff" />
                </LinearGradient>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity onPress={handleGenerate} activeOpacity={0.8} style={{ flex: 1, marginLeft: 15 }}>
                <LinearGradient
                  colors={[COLORS.gold, COLORS.goldDark]}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                  style={styles.generateBtnGradient}
                >
                  <MaterialCommunityIcons name="creation" size={20} color="#333" />
                  <Text style={styles.generateBtnText}>Generate Plan</Text>
                </LinearGradient>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Nested District Modal moved here for cleaner scope within Modal */}
        <Modal visible={isDistrictModalVisible} animationType="slide" transparent={true}>
          <View style={styles.districtModalOverlay}>
            <View style={styles.districtModalContent}>
              <View style={styles.districtHeader}>
                <Text style={styles.districtTitle}>Select Destination</Text>
                <TouchableOpacity onPress={() => setDistrictModalVisible(false)} style={styles.closeModalCircle}>
                  <MaterialIcons name="close" size={20} color="#555" />
                </TouchableOpacity>
              </View>

              <View style={styles.searchBox}>
                <MaterialIcons name="search" size={22} color="#999" />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Type to search..."
                  placeholderTextColor="#999"
                  value={districtSearch}
                  onChangeText={setDistrictSearch}
                  autoFocus
                />
              </View>

              <FlatList
                data={districs.filter(d => d.name.toLowerCase().includes(districtSearch.toLowerCase()))}
                keyExtractor={item => item.name}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.districtItem}
                    onPress={() => {
                      updateData('destination', item.name);
                      setDistrictModalVisible(false);
                      setDistrictSearch("");
                    }}
                  >
                    <Image source={item.image} style={styles.districtThumb} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.districtItemText}>{item.name}</Text>
                      <Text style={styles.districtItemSub}>{item.province}</Text>
                    </View>
                    {tripData.destination === item.name && <MaterialIcons name="check-circle" size={22} color={COLORS.primary} />}
                  </TouchableOpacity>
                )}
                showsVerticalScrollIndicator={false}
              />
            </View>
          </View>
        </Modal>

      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 }
  },
  headerTitle: { fontSize: 24, fontWeight: '800', color: COLORS.textDark, letterSpacing: -0.5 },
  headerSubtitle: { fontSize: 13, color: COLORS.textLight, marginTop: 2 },
  historyBtn: { padding: 10, backgroundColor: '#EDF2F7', borderRadius: 40 },

  // Empty State Premium
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  emptyImage: { width: 140, height: 140, marginBottom: 25, opacity: 0.9 },
  emptyTitle: { fontSize: 22, fontWeight: '800', color: COLORS.textDark, marginBottom: 12 },
  emptyText: { fontSize: 15, color: COLORS.textLight, textAlign: 'center', lineHeight: 24, marginBottom: 35 },
  createBtnGradient: {
    flexDirection: 'row',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 50,
    alignItems: 'center',
    gap: 10,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8
  },
  createBtnText: { color: '#fff', fontSize: 16, fontWeight: '700', letterSpacing: 0.5 },

  // List & Cards
  listContent: { padding: 20, paddingBottom: 100 },
  fabBtn: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    borderRadius: 30,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6
  },
  fabGradient: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center'
  },

  planCard: {
    height: 220,
    borderRadius: 24,
    backgroundColor: '#fff',
    marginBottom: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 15,
    elevation: 8
  },
  planImage: { width: '100%', height: '100%' },
  planOverlay: {
    ...StyleSheet.absoluteFillObject,
    padding: 20,
    justifyContent: 'space-between'
  },
  planTopRow: { flexDirection: 'row', justifyContent: 'space-between' },
  planBadge: {
    backgroundColor: COLORS.gold,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backdropFilter: 'blur(10px)'
  },
  planBadgeText: { fontSize: 11, fontWeight: '800', color: '#333', letterSpacing: 0.5 },
  planTitle: { color: '#fff', fontSize: 26, fontWeight: '800', marginBottom: 6, letterSpacing: -0.5 },
  planSubtitle: { color: 'rgba(255,255,255,0.95)', fontSize: 14, fontWeight: '500' },
  planMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },

  // Modal Structure
  modalContainer: { flex: 1, backgroundColor: '#fff' },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5'
  },
  closeBtn: { padding: 5 },
  modalTitle: { fontSize: 18, fontWeight: '700', color: COLORS.textDark },
  stepIndicator: { fontSize: 16, fontWeight: '700' },
  progressBarContainer: { height: 4, backgroundColor: '#f0f0f0', width: '100%' },
  progressBarInfo: { height: '100%' },

  modalContent: { padding: 24 },

  // Step Styles
  stepContainer: {},
  stepHeader: { flexDirection: 'row', alignItems: 'center', gap: 15, marginBottom: 30 },
  stepIconContainer: { width: 45, height: 45, borderRadius: 12, backgroundColor: '#e3f2fd', alignItems: 'center', justifyContent: 'center' },
  stepTitle: { fontSize: 22, fontWeight: '800', color: COLORS.textDark },
  stepSubtitle: { fontSize: 14, color: COLORS.textLight, marginTop: 2 },
  label: { fontSize: 15, fontWeight: '700', color: COLORS.textDark, marginBottom: 15 },

  // Destination Inputs
  destinationToggleRow: {
    gap: 15,
    marginBottom: 30
  },
  surpriseBtnContainer: { height: 60, borderRadius: 16 },
  surpriseBtnActiveShadow: {
    shadowColor: COLORS.gold,
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 5
  },
  surpriseBtnGradient: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, borderRadius: 16 },
  surpriseBtnPlain: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, borderRadius: 16, borderWidth: 2, borderColor: COLORS.gold, backgroundColor: '#fff' },
  surpriseBtnText: { fontSize: 16, fontWeight: '700', color: COLORS.goldDark },

  orText: { textAlign: 'center', color: '#bbb', fontSize: 12, fontWeight: '600', marginBottom: 10 },

  selectInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 16,
    padding: 18,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 5,
    elevation: 2
  },
  inputLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  selectInputText: { fontSize: 16, color: COLORS.textDark, fontWeight: '500' },
  placeholderText: { color: '#999' },
  disabledInput: { backgroundColor: '#f9f9f9', borderColor: '#eee', opacity: 0.6 },
  disabledInputText: { color: '#aaa' },

  durationHighlight: { color: COLORS.primary, fontWeight: '700' },
  calendarContainer: {
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    paddingBottom: 5
  },

  // Grid & Cards
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  choiceCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#eee',
    gap: 12,
    shadowColor: '#000',
    shadowOpacity: 0.02,
    shadowRadius: 5
  },
  choiceCardActive: { borderColor: COLORS.primary, backgroundColor: '#e3f2fd' },
  iconCircle: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#f5f5f5', alignItems: 'center', justifyContent: 'center' },
  iconCircleActive: { backgroundColor: COLORS.primary },
  choiceLabel: { fontSize: 14, fontWeight: '600', color: COLORS.textDark, textAlign: 'center' },
  choiceLabelActive: { color: COLORS.primary },
  checkedBadge: { position: 'absolute', top: 10, right: 10, backgroundColor: COLORS.primary, borderRadius: 10, padding: 2 },

  budgetCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#eee',
    gap: 15
  },
  budgetCardActive: { borderColor: COLORS.primary, backgroundColor: '#e3f2fd' },
  budgetIconBox: { width: 45, height: 45, borderRadius: 12, backgroundColor: '#f0f0f0', alignItems: 'center', justifyContent: 'center' },
  budgetIconBoxActive: { backgroundColor: COLORS.primary },
  budgetDesc: { fontSize: 12, color: COLORS.textLight, marginTop: 2 },

  // Chips
  chipsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  interestChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 30,
    backgroundColor: '#EDF2F7',
    borderWidth: 1,
    borderColor: 'transparent',
    overflow: 'hidden'
  },
  interestChipActive: { borderColor: COLORS.gold },
  interestLabel: { color: COLORS.textDark, fontWeight: '600', fontSize: 13 },
  interestLabelActive: { color: '#333' },

  // Footer & Buttons
  modalFooter: {
    flexDirection: 'row',
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: '#f5f5f5',
    alignItems: 'center',
    backgroundColor: '#fff',
    justifyContent: 'space-between'
  },
  backBtn: { paddingHorizontal: 20 },
  backBtnText: { color: COLORS.textLight, fontSize: 16, fontWeight: '600' },
  nextBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 30,
    gap: 8,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5
  },
  nextBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  generateBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 30,
    gap: 8,
    shadowColor: COLORS.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6
  },
  generateBtnText: { color: '#333', fontSize: 16, fontWeight: '800' },

  // District Modal
  districtModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  districtModalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    height: '92%',
    padding: 25,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 20
  },
  districtHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 25
  },
  districtTitle: { fontSize: 24, fontWeight: '800', color: COLORS.textDark },
  closeModalCircle: { padding: 8, backgroundColor: '#f0f0f0', borderRadius: 20 },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    paddingHorizontal: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#eee',
    height: 56
  },
  searchInput: { flex: 1, height: '100%', marginLeft: 12, fontSize: 16, color: COLORS.textDark },
  districtItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
    gap: 16
  },
  districtThumb: { width: 56, height: 56, borderRadius: 12, backgroundColor: '#eee' },
  districtItemText: { fontSize: 17, fontWeight: '600', color: COLORS.textDark },
  districtItemSub: { fontSize: 13, color: COLORS.textLight, marginTop: 2 },
});

export default TourismPlanScreen;
