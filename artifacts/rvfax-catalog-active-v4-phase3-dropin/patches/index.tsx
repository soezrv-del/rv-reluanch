
import {
  View, Text, StyleSheet, Pressable, ScrollView,
  Modal, FlatList, TouchableOpacity, ActivityIndicator, Alert, Linking, TextInput, KeyboardAvoidingView, Platform, Dimensions,
} from 'react-native';
import React, { useState, useCallback, useEffect, useRef } from 'react';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withTiming } from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Spacing, Radius, FontSize, FontWeight } from '@/constants/theme';
import {
  RV_DATA, MAKES, YEARS, CLASSIC_BRANDS,
  ensureCatalogLoaded, isCatalogLoaded,
} from '@/constants/rvData';
import type { RVSpec } from '@/constants/rvData';
import { refreshCatalogFromServer } from '@/services/catalogSync';
import { computeRating } from '@/constants/ratingData';
import { generateAndShareRVReport } from '@/services/pdfService';
import { useAuth, getSupabaseClient } from '@/template';
import { CameraView, useCameraPermissions } from 'expo-camera';

// Safe camera hook — returns null stubs on web to prevent crash
function useSafeCameraPermissions() {
  if (Platform.OS === 'web') {
    return [null, async () => ({ granted: false })] as const;
  }
  // eslint-disable-next-line react-hooks/rules-of-hooks
  return useCameraPermissions();
}

// ─── TYPES ────────────────────────────────────────────────────────────────────

interface RVResult {
  year: string;
  make: string;
  model: string;
  floorplan: string;
  data: RVSpec;
  saved: boolean;
}

interface RecentSearch {
  id: string;
  label: string;
  sub: string;
}

// ─── VIN DECODE RESULT TYPE ─────────────────────────────────────────────────────

interface VinDecodeResult {
  vin: string;
  valid: boolean;
  errorText: string;
  year: string;
  make: string;
  model: string;
  trim: string;
  series: string;
  vehicleType: string;
  bodyClass: string;
  engineDisplacement: string;
  engineCylinders: string;
  engineHP: string;
  fuelType: string;
  driveType: string;
  transmissionStyle: string;
  transmissionSpeeds: string;
  gvwr: string;
  manufacturer: string;
  plantCountry: string;
  plantCity: string;
  plantState: string;
  abs: string;
  airBags: string;
}

// ─── VIN DECODER MODAL ───────────────────────────────────────────────────────

interface NhtsaRecall {
  component: string;
  summary: string;
  consequence: string;
  remedy: string;
  date: string;
  campaignNumber: string;
}

function VinDecoderModal({
  visible, onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const [vin, setVin] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VinDecodeResult | null>(null);
  const [error, setError] = useState('');
  const [recalls, setRecalls] = useState<NhtsaRecall[]>([]);
  const [recallCount, setRecallCount] = useState<number | null>(null);
  const [recallLoading, setRecallLoading] = useState(false);
  const [expandedRecall, setExpandedRecall] = useState<number | null>(null);
  const [showScanner, setShowScanner] = useState(false);
  const [cameraPermission, requestCameraPermission] = useSafeCameraPermissions();

  const clean = vin.trim().toUpperCase().replace(/[^A-HJ-NPR-Z0-9]/g, '');
  const isReady = clean.length === 17;

  const handleDecode = useCallback(async () => {
    setLoading(true);
    setError('');
    setResult(null);
    setRecalls([]);
    setRecallCount(null);
    setExpandedRecall(null);
    try {
      const supabase = getSupabaseClient();
      const { data, error: fnErr } = await supabase.functions.invoke('vin-decoder', {
        body: { vin: clean },
      });
      if (fnErr) {
        setError('Decode failed. Check the VIN and try again.');
        return;
      }
      if (data?.error) {
        setError(data.error);
        return;
      }
      const decoded = data as VinDecodeResult;
      setResult(decoded);

      // Fetch live NHTSA recalls using decoded make/model/year
      if (decoded.make && decoded.model && decoded.year) {
        setRecallLoading(true);
        try {
          const { data: nhtsaData } = await supabase.functions.invoke('nhtsa-lookup', {
            body: { make: decoded.make, model: decoded.model, year: decoded.year },
          });
          if (nhtsaData) {
            setRecallCount(nhtsaData.recallCount ?? 0);
            setRecalls(nhtsaData.recalls ?? []);
          }
        } catch {
          setRecallCount(0);
        } finally {
          setRecallLoading(false);
        }
      }
    } catch {
      setError('Could not reach the VIN service. Check your connection.');
    } finally {
      setLoading(false);
    }
  }, [clean]);

  const handleClose = () => {
    setVin('');
    setResult(null);
    setError('');
    setRecalls([]);
    setRecallCount(null);
    setExpandedRecall(null);
    setShowScanner(false);
    onClose();
  };

  // RV detection — only true motorhome/coach body classes
  const isRV = result && (
    result.bodyClass?.toLowerCase().includes('motorhome') ||
    result.bodyClass?.toLowerCase().includes('motor home') ||
    result.bodyClass?.toLowerCase().includes('coach') ||
    result.vehicleType?.toLowerCase().includes('incomplete') ||
    (result as any).busType?.toLowerCase().includes('motorhome')
  );

  // Format recall date from NHTSA format
  function formatRecallDate(raw: string): string {
    if (!raw) return '';
    const match = raw.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
    if (match) return `${match[1].padStart(2,'0')}/${match[2].padStart(2,'0')}/${match[3]}`;
    const d = new Date(raw);
    if (!isNaN(d.getTime())) {
      return d.toLocaleDateString('en-AU', { day: '2-digit', month: '2-digit', year: 'numeric' });
    }
    return raw;
  }

  const assemblyParts = [result?.plantCity, result?.plantState, result?.plantCountry]
    .filter(Boolean).join(', ');

  const engineLabel = [result?.engineDisplacement ? result.engineDisplacement + 'L' : '',
    result?.engineCylinders ? result.engineCylinders + '-cyl' : '',
    result?.engineHP ? result.engineHP + 'HP' : ''].filter(Boolean).join(' ');

  const { width: screenW } = Dimensions.get('window');

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.8)' }}
      >
        <View style={vinModal.sheet}>
          <View style={vinModal.handle} />

          {/* Header */}
          <View style={vinModal.header}>
            <Pressable onPress={handleClose} style={vinModal.closeBtn} hitSlop={8}>
              <MaterialIcons name="close" size={20} color={Colors.textSecondary} />
            </Pressable>
            <View style={vinModal.headerCenter}>
              <MaterialIcons name="qr-code-scanner" size={16} color={Colors.blueBright} />
              <Text style={vinModal.title}>VIN Decoder</Text>
            </View>
            <View style={{ width: 36 }} />
          </View>

          <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

            {/* VIN Input + Action Buttons */}
            <View style={vinModal.inputSection}>
              <View style={vinModal.inputRow}>
                <TextInput
                  style={[vinModal.input, isReady && { borderColor: Colors.blueBright }]}
                  value={vin}
                  onChangeText={t => setVin(t.toUpperCase().replace(/[^A-HJ-NPR-Z0-9]/gi, '').slice(0, 17))}
                  placeholder="Enter 17-character VIN"
                  placeholderTextColor={Colors.textMuted}
                  autoCorrect={false}
                  maxLength={17}
                />
                <View style={vinModal.charCount}>
                  <Text style={[vinModal.charCountText, isReady && { color: Colors.green }]}>
                    {clean.length}/17
                  </Text>
                </View>
              </View>

              {/* Action row: Decode + Scan */}
              <View style={vinModal.actionRow}>
                <Pressable
                  style={({ pressed }) => [
                    vinModal.decodeBtn,
                    { flex: 1 },
                    !isReady && vinModal.decodeBtnDisabled,
                    pressed && isReady && { opacity: 0.85, transform: [{ scale: 0.98 }] },
                  ]}
                  onPress={handleDecode}
                  disabled={!isReady || loading}
                >
                  {loading ? (
                    <ActivityIndicator color={Colors.silverBright} size="small" />
                  ) : (
                    <>
                      <MaterialIcons name="search" size={18} color={!isReady ? Colors.textMuted : Colors.silverBright} />
                      <Text style={[vinModal.decodeBtnText, !isReady && { color: Colors.textMuted }]}>
                        Decode VIN
                      </Text>
                    </>
                  )}
                </Pressable>

                {/* VIN Barcode Scanner Button */}
                <Pressable
                  style={({ pressed }) => [vinModal.scanBtn, pressed && { opacity: 0.8, transform: [{ scale: 0.97 }] }]}
                  onPress={async () => {
                    if (Platform.OS === 'web') {
                      Alert.alert('Not Available', 'Camera scanning is only available on iOS and Android.');
                      return;
                    }
                    if (!cameraPermission?.granted) {
                      const res = await requestCameraPermission();
                      if (!res.granted) {
                        Alert.alert('Camera Access Required', 'Please allow camera access in Settings to scan VIN barcodes.');
                        return;
                      }
                    }
                    setShowScanner(true);
                  }}
                >
                  <MaterialIcons name="qr-code-scanner" size={20} color={Colors.blueBright} />
                  <Text style={vinModal.scanBtnText}>Scan</Text>
                </Pressable>
              </View>

              {/* Scan hint */}
              <View style={vinModal.scanHintRow}>
                <MaterialIcons name="info-outline" size={11} color={Colors.textDim} />
                <Text style={vinModal.scanHintText}>
                  Tap Scan to read the VIN barcode from the dashboard, door jamb, or registration
                </Text>
              </View>
            </View>

            {/* Error */}
            {!!error && (
              <View style={vinModal.errorCard}>
                <MaterialIcons name="error-outline" size={16} color={Colors.red} />
                <Text style={vinModal.errorText}>{error}</Text>
              </View>
            )}

            {/* Results */}
            {result && (
              <View style={vinModal.results}>

                {/* Identity hero */}
                <View style={vinModal.identityCard}>
                  <View style={vinModal.identityTopRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={vinModal.identityYear}>{result.year}</Text>
                      <Text style={vinModal.identityName}>{result.make} {result.model}</Text>
                      {(result.trim || result.series) ? (
                        <Text style={vinModal.identityTrim}>{result.trim || result.series}</Text>
                      ) : null}
                    </View>
                    {/* Recall count badge */}
                    {recallLoading ? (
                      <View style={vinModal.recallLoadingBadge}>
                        <ActivityIndicator size="small" color={Colors.blueBright} style={{ transform: [{ scale: 0.7 }] }} />
                      </View>
                    ) : recallCount !== null ? (
                      recallCount > 0 ? (
                        <View style={vinModal.recallCountBadge}>
                          <MaterialIcons name="warning" size={13} color="#000" />
                          <Text style={vinModal.recallCountText}>{recallCount} Recall{recallCount > 1 ? 's' : ''}</Text>
                        </View>
                      ) : (
                        <View style={vinModal.noRecallBadge}>
                          <MaterialIcons name="verified" size={13} color={Colors.green} />
                          <Text style={vinModal.noRecallText}>No Recalls</Text>
                        </View>
                      )
                    ) : null}
                  </View>

                  {/* Badges row */}
                  <View style={vinModal.identityBadges}>
                    {result.bodyClass ? (
                      <View style={vinModal.badge}>
                        <Text style={vinModal.badgeText}>{result.bodyClass}</Text>
                      </View>
                    ) : null}
                    {isRV ? (
                      <View style={[vinModal.badge, { backgroundColor: 'rgba(74,222,128,0.15)', borderColor: 'rgba(74,222,128,0.4)' }]}>
                        <MaterialIcons name="verified" size={11} color={Colors.green} />
                        <Text style={[vinModal.badgeText, { color: Colors.green }]}>RV Verified</Text>
                      </View>
                    ) : null}
                  </View>

                  <View style={vinModal.vinChip}>
                    <Text style={vinModal.vinChipLabel}>VIN</Text>
                    <Text style={vinModal.vinChipText}>{result.vin}</Text>
                  </View>
                </View>

                {/* Vehicle Details — 2-column grid */}
                <View style={vinModal.sectionBlock}>
                  <Text style={vinModal.sectionBlockTitle}>VEHICLE DETAILS</Text>
                  <View style={vinModal.detailGrid}>
                    {result.bodyClass ? (
                      <View style={vinModal.detailCell}>
                        <Text style={vinModal.detailCellLabel}>Body Class</Text>
                        <Text style={vinModal.detailCellValue}>{result.bodyClass}</Text>
                      </View>
                    ) : null}
                    {result.vehicleType ? (
                      <View style={vinModal.detailCell}>
                        <Text style={vinModal.detailCellLabel}>Vehicle Type</Text>
                        <Text style={vinModal.detailCellValue}>{result.vehicleType}</Text>
                      </View>
                    ) : null}
                    {engineLabel ? (
                      <View style={vinModal.detailCell}>
                        <Text style={vinModal.detailCellLabel}>Engine</Text>
                        <Text style={vinModal.detailCellValue}>{engineLabel}</Text>
                      </View>
                    ) : null}
                    {result.fuelType ? (
                      <View style={vinModal.detailCell}>
                        <Text style={vinModal.detailCellLabel}>Fuel Type</Text>
                        <Text style={[vinModal.detailCellValue, { color: Colors.green }]}>{result.fuelType}</Text>
                      </View>
                    ) : null}
                    {result.gvwr ? (
                      <View style={vinModal.detailCell}>
                        <Text style={vinModal.detailCellLabel}>GVWR</Text>
                        <Text style={vinModal.detailCellValue}>{result.gvwr}</Text>
                      </View>
                    ) : null}
                    {result.manufacturer ? (
                      <View style={vinModal.detailCell}>
                        <Text style={vinModal.detailCellLabel}>Manufacturer</Text>
                        <Text style={vinModal.detailCellValue}>{result.manufacturer}</Text>
                      </View>
                    ) : null}
                    {result.driveType ? (
                      <View style={vinModal.detailCell}>
                        <Text style={vinModal.detailCellLabel}>Drive Type</Text>
                        <Text style={vinModal.detailCellValue}>{result.driveType}</Text>
                      </View>
                    ) : null}
                    {result.transmissionStyle ? (
                      <View style={vinModal.detailCell}>
                        <Text style={vinModal.detailCellLabel}>Transmission</Text>
                        <Text style={vinModal.detailCellValue}>
                          {[result.transmissionStyle, result.transmissionSpeeds ? result.transmissionSpeeds + '-spd' : ''].filter(Boolean).join(' ')}
                        </Text>
                      </View>
                    ) : null}
                  </View>
                </View>

                {/* Assembly — full width */}
                {assemblyParts ? (
                  <View style={vinModal.assemblyCard}>
                    <Text style={vinModal.detailCellLabel}>Assembly</Text>
                    <Text style={vinModal.assemblyValue}>{assemblyParts.toUpperCase()}</Text>
                  </View>
                ) : null}

                {/* NHTSA Recall Section */}
                {recallCount !== null && recallCount > 0 && recalls.length > 0 ? (
                  <View style={vinModal.recallSection}>
                    <View style={vinModal.recallSectionHeader}>
                      <MaterialIcons name="warning" size={14} color={Colors.orange} />
                      <Text style={vinModal.recallSectionTitle}>
                        {recallCount} NHTSA RECALL{recallCount > 1 ? 'S' : ''} ON RECORD
                      </Text>
                    </View>
                    {recalls.map((r, i) => (
                      <Pressable
                        key={i}
                        style={({ pressed }) => [vinModal.recallItem, pressed && { opacity: 0.8 }]}
                        onPress={() => setExpandedRecall(expandedRecall === i ? null : i)}
                      >
                        <View style={vinModal.recallItemMain}>
                          <View style={vinModal.recallItemLeft}>
                            <Text style={vinModal.recallComponent} numberOfLines={expandedRecall === i ? 0 : 1}>
                              {r.component}
                            </Text>
                            <Text style={vinModal.recallDate}>{formatRecallDate(r.date)}</Text>
                            {expandedRecall === i && r.summary ? (
                              <Text style={vinModal.recallSummary}>{r.summary}</Text>
                            ) : null}
                            {expandedRecall === i && r.remedy ? (
                              <View style={vinModal.recallRemedyRow}>
                                <MaterialIcons name="build" size={11} color={Colors.green} />
                                <Text style={vinModal.recallRemedy}>{r.remedy}</Text>
                              </View>
                            ) : null}
                          </View>
                          <MaterialIcons
                            name={expandedRecall === i ? 'keyboard-arrow-up' : 'keyboard-arrow-right'}
                            size={18}
                            color={Colors.orange}
                          />
                        </View>
                      </Pressable>
                    ))}
                  </View>
                ) : recallCount === 0 ? (
                  <View style={vinModal.noRecallSection}>
                    <MaterialIcons name="verified" size={16} color={Colors.green} />
                    <Text style={vinModal.noRecallSectionText}>No NHTSA recalls on record</Text>
                  </View>
                ) : null}

                {/* Verify at NHTSA */}
                <Pressable
                  style={({ pressed }) => [vinModal.nhtsaBtn, pressed && { opacity: 0.75 }]}
                  onPress={() => Linking.openURL(`https://www.nhtsa.gov/vehicle/${result.vin}`)}
                >
                  <MaterialIcons name="open-in-new" size={14} color={Colors.blueBright} />
                  <Text style={vinModal.nhtsaBtnText}>Verify this VIN on NHTSA.gov</Text>
                </Pressable>

                {/* Look Up in RvFax */}
                <Pressable
                  style={({ pressed }) => [vinModal.lookupBtn, pressed && { opacity: 0.88, transform: [{ scale: 0.98 }] }]}
                  onPress={() => {
                    handleClose();
                    setTimeout(() => {
                      // Pre-fill make in search
                    }, 100);
                  }}
                >
                  <MaterialIcons name="description" size={18} color={Colors.silverBright} />
                  <View style={{ flex: 1 }}>
                    <Text style={vinModal.lookupBtnTitle}>Look Up This RV</Text>
                    <Text style={vinModal.lookupBtnSub}>{result.year} {result.make} {result.model} · Full Report</Text>
                  </View>
                  <MaterialIcons name="arrow-forward" size={18} color={Colors.silverBright} />
                </Pressable>

                <View style={vinModal.disclaimer}>
                  <MaterialIcons name="info-outline" size={11} color={Colors.textMuted} />
                  <Text style={vinModal.disclaimerText}>
                    Data sourced from NHTSA vPIC public database. Not all fields are available for all vehicles.
                  </Text>
                </View>
              </View>
            )}

            <View style={{ height: 32 }} />
          </ScrollView>
        </View>
      </KeyboardAvoidingView>

      {/* ── VIN BARCODE SCANNER FULL-SCREEN ── */}
      {showScanner && (
        <Modal visible={showScanner} transparent={false} animationType="slide" onRequestClose={() => setShowScanner(false)}>
          <View style={vinModal.scannerContainer}>
            <CameraView
              style={StyleSheet.absoluteFill}
              facing="back"
              barcodeScannerSettings={{ barcodeTypes: ['code39', 'code128', 'datamatrix', 'pdf417', 'qr'] }}
              onBarcodeScanned={({ data }) => {
                const cleaned = data.replace(/[^A-HJ-NPR-Z0-9]/gi, '').toUpperCase().slice(0, 17);
                if (cleaned.length >= 10) {
                  setVin(cleaned);
                  setShowScanner(false);
                }
              }}
            />
            {/* Semi-transparent overlay with cutout */}
            <View style={StyleSheet.absoluteFill} pointerEvents="none">
              {/* Top dim */}
              <View style={{ flex: 1.2, backgroundColor: 'rgba(0,0,0,0.72)' }} />
              {/* Middle row with frame */}
              <View style={{ flexDirection: 'row', height: 90 }}>
                <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.72)' }} />
                {/* Clear frame */}
                <View style={{ width: screenW * 0.82, position: 'relative' }}>
                  {/* Corner brackets */}
                  <View style={[vinModal.scanCorner, { top: 0, left: 0, borderRightWidth: 0, borderBottomWidth: 0 }]} />
                  <View style={[vinModal.scanCorner, { top: 0, right: 0, borderLeftWidth: 0, borderBottomWidth: 0 }]} />
                  <View style={[vinModal.scanCorner, { bottom: 0, left: 0, borderRightWidth: 0, borderTopWidth: 0 }]} />
                  <View style={[vinModal.scanCorner, { bottom: 0, right: 0, borderLeftWidth: 0, borderTopWidth: 0 }]} />
                </View>
                <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.72)' }} />
              </View>
              {/* Bottom dim */}
              <View style={{ flex: 2, backgroundColor: 'rgba(0,0,0,0.72)' }} />
            </View>

            {/* Bottom UI (touchable) */}
            <View style={vinModal.scannerBottomUi}>
              <Text style={vinModal.scannerHint}>Align the VIN barcode within the frame</Text>
              <Text style={vinModal.scannerHint2}>Usually on the dashboard, door jamb, or title document</Text>
              <Pressable
                style={({ pressed }) => [vinModal.scannerCloseBtn, pressed && { opacity: 0.8 }]}
                onPress={() => setShowScanner(false)}
              >
                <MaterialIcons name="close" size={18} color="#000" />
                <Text style={vinModal.scannerCloseBtnText}>Cancel Scan</Text>
              </Pressable>
            </View>
          </View>
        </Modal>
      )}
    </Modal>
  );
}

// ─── SESSION CACHE FOR NHTSA RECALL COUNTS ─────────────────────────────────────
// Keyed by `make|model|year` — persists for the lifetime of the JS bundle session
const nhtsaRecallCache = new Map<string, number>();

// ─── DROPDOWN MODAL ───────────────────────────────────────────────────────────

function DropdownModal({
  visible, title, items, selected, onSelect, onClose, allowFreeText = false,
}: {
  visible: boolean;
  title: string;
  items: string[];
  selected: string;
  onSelect: (val: string) => void;
  onClose: () => void;
  allowFreeText?: boolean;
}) {
  const [query, setQuery] = useState('');

  const sheetScale   = useSharedValue(0.95);
  const sheetOpacity = useSharedValue(0);

  const animatedSheetStyle = useAnimatedStyle(() => ({
    transform: [{ scale: sheetScale.value }],
    opacity: sheetOpacity.value,
  }));

  useEffect(() => {
    if (visible) {
      setQuery('');
      sheetScale.value   = 0.95;
      sheetOpacity.value = 0;
      sheetScale.value   = withSpring(1, { damping: 22, stiffness: 320 });
      sheetOpacity.value = withTiming(1, { duration: 200 });
    }
  }, [visible, sheetOpacity, sheetScale]); // Added sheetOpacity, sheetScale to dependencies

  const filtered = query.trim()
    ? items.filter(i => i.toLowerCase().includes(query.toLowerCase()))
    : items;

  const showManualEntry = allowFreeText && query.trim().length > 0 &&
    !items.some(i => i.toLowerCase() === query.trim().toLowerCase());

  const handleConfirmManual = () => {
    const val = query.trim();
    if (val) { onSelect(val); onClose(); setQuery(''); }
  };

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.75)' }}
      >
        <Animated.View style={[styles.modalSheet, animatedSheetStyle]}>
          <View style={styles.modalHandle} />
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{title}</Text>
            <Pressable onPress={onClose} hitSlop={8}>
              <MaterialIcons name="close" size={22} color={Colors.textSecondary} />
            </Pressable>
          </View>

          <View style={styles.modalSearchRow}>
            <MaterialIcons name="search" size={16} color={Colors.textMuted} />
            <TextInput
              style={styles.modalSearchInput}
              placeholder={allowFreeText ? 'Search or type to enter manually...' : 'Search...'}
              placeholderTextColor={Colors.textMuted}
              value={query}
              onChangeText={setQuery}
              returnKeyType={allowFreeText ? 'done' : 'search'}
              onSubmitEditing={allowFreeText ? handleConfirmManual : undefined}
              autoCorrect={false}
            />
            {query.length > 0 && (
              <Pressable onPress={() => setQuery('')} hitSlop={8}>
                <MaterialIcons name="close" size={14} color={Colors.textMuted} />
              </Pressable>
            )}
          </View>

          {showManualEntry && (
            <Pressable
              style={({ pressed }) => [styles.modalManualEntry, pressed && { opacity: 0.8 }]}
              onPress={handleConfirmManual}
            >
              <MaterialIcons name="edit" size={15} color={Colors.blueBright} />
              <Text style={styles.modalManualEntryText}>
                Use <Text style={{ color: Colors.blueBright, fontWeight: FontWeight.bold }}>"{query.trim()}"</Text>
              </Text>
              <MaterialIcons name="arrow-forward" size={14} color={Colors.blueBright} />
            </Pressable>
          )}

          <FlatList
            data={filtered}
            keyExtractor={i => i}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            ListEmptyComponent={
              <View style={styles.modalEmpty}>
                <MaterialIcons name="search-off" size={24} color={Colors.textDim} />
                <Text style={styles.modalEmptyText}>
                  {allowFreeText ? 'No matches — type above to enter manually' : 'No matches found'}
                </Text>
              </View>
            }
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.modalItem, item === selected && styles.modalItemSelected]}
                onPress={() => { onSelect(item); onClose(); setQuery(''); }}
                activeOpacity={0.7}
              >
                <Text style={[styles.modalItemText, item === selected && styles.modalItemTextSelected]}>
                  {item}
                </Text>
                {item === selected && (
                  <MaterialIcons name="check" size={18} color={Colors.blueBright} />
                )}
              </TouchableOpacity>
            )}
          />
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ─── RV RESULT CARD ───────────────────────────────────────────────────────────

function RVCard({
  result, onToggleSave, onGeneratePDF, onViewDetails, onOpenCal, onOpenGrok,
}: {
  result: RVResult;
  onToggleSave: () => void;
  onGeneratePDF: () => void;
  onViewDetails: () => void;
  onOpenCal: () => void;
  onOpenGrok: () => void;
}) {
  const { data } = result;

  const [liveRecalls, setLiveRecalls] = useState<number | null>(null);
  const [recallLoading, setRecallLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const cacheKey = `${result.make}|${result.model}|${result.year}`;

    if (nhtsaRecallCache.has(cacheKey)) {
      setLiveRecalls(nhtsaRecallCache.get(cacheKey)!);
      setRecallLoading(false);
      return;
    }

    async function fetchRecalls() {
      try {
        const supabase = getSupabaseClient();
        const { data: nhtsaData, error } = await supabase.functions.invoke('nhtsa-lookup', {
          body: { make: result.make, model: result.model, year: result.year },
        });
        if (!cancelled && !error && nhtsaData) {
          const count = nhtsaData.recallCount ?? 0;
          nhtsaRecallCache.set(cacheKey, count);
          setLiveRecalls(count);
        }
      } catch {
        // fall back to static value
      } finally {
        if (!cancelled) setRecallLoading(false);
      }
    }
    fetchRecalls();
    return () => { cancelled = true; };
  }, [result.make, result.model, result.year]);

  const displayRecalls = liveRecalls !== null ? liveRecalls : data.recalls;
  const hasRecall = displayRecalls > 0;

  return (
    <View style={styles.rvCard}>
      <Pressable onPress={onViewDetails}>
        <View style={styles.rvCardImageWrapper}>
          <Image
            source={require('@/assets/entegra-hero.png')}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
            transition={300}
          />
          {/* Subtle gradient so text badges stay readable */}
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.45)']}
            style={StyleSheet.absoluteFill}
            pointerEvents="none"
          />
          <View style={styles.rvCardTypeBadge}>
            <Text style={styles.rvCardTypeText}>{data.type}</Text>
          </View>
          {recallLoading ? (
            <View style={styles.noRecallBadge}>
              <ActivityIndicator size="small" color={Colors.blueBright} style={{ transform: [{ scale: 0.6 }] }} />
              <Text style={styles.noRecallBadgeText}>Loading...</Text>
            </View>
          ) : hasRecall ? (
            <View style={styles.recallBadge}>
              <MaterialIcons name="warning" size={11} color="#000" />
              <Text style={styles.recallBadgeText}>{displayRecalls} Recall{displayRecalls > 1 ? 's' : ''}</Text>
            </View>
          ) : (
            <View style={styles.noRecallBadge}>
              <MaterialIcons name="verified" size={11} color={Colors.green} />
              <Text style={[styles.noRecallBadgeText, { color: Colors.green }]}>No Recalls</Text>
            </View>
          )}
          <View style={styles.tapHint}>
            <MaterialIcons name="info" size={10} color="rgba(255,255,255,0.6)" />
            <Text style={styles.tapHintText}>Tap for full details</Text>
          </View>
        </View>
      </Pressable>

      <View style={styles.rvCardBody}>
        <Pressable onPress={onViewDetails}>
          <View style={styles.rvCardTitleRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.rvCardYear}>{result.year}</Text>
              <Text style={styles.rvCardName} numberOfLines={1}>
                {result.make} {result.model}
              </Text>
              {result.floorplan ? (
                <Text style={styles.rvCardFloorplan}>Floorplan: {result.floorplan}</Text>
              ) : null}
            </View>
            <Pressable onPress={onToggleSave} style={styles.heartBtn} hitSlop={8}>
              <MaterialIcons
                name={result.saved ? 'favorite' : 'favorite-border'}
                size={22}
                color={result.saved ? Colors.red : Colors.textMuted}
              />
            </Pressable>
          </View>
        </Pressable>

        <View style={styles.rvCardRatingRow}>
        <MaterialIcons name="star" size={14} color={Colors.silver} />
          <Text style={styles.rvCardRating}>{computeRating(result.make, result.model, result.year).toFixed(1)}</Text>
          <Text style={styles.rvCardPrice}>
            ${data.msrpRange[0].toLocaleString()} – ${data.msrpRange[1].toLocaleString()}
          </Text>
        </View>

        <View style={styles.specsGrid}>
          <SpecChip icon="straighten" label={`${data.lengthRange[0]}–${data.lengthRange[1]} ft`} />
          <SpecChip icon="hotel" label={`Sleeps ${data.sleeps}`} />
          <SpecChip icon="view-carousel" label={`${data.slideouts} slides`} />
          <SpecChip icon={data.fuelType === 'Diesel' ? 'local-gas-station' : 'ev-station'} label={data.fuelType} />
          {data.engine ? <SpecChip icon="settings" label={data.engine} wide /> : null}
          {data.chassis ? <SpecChip icon="directions-bus" label={data.chassis} wide /> : null}
        </View>

        <View style={styles.floorplanRow}>
          <Text style={styles.floorplanLabel}>Available Floorplans:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 4 }}>
            <View style={{ flexDirection: 'row', gap: 6 }}>
              {data.floorplans.map(fp => (
                <View key={fp} style={styles.fpChip}>
                  <Text style={styles.fpChipText}>{fp}</Text>
                </View>
              ))}
            </View>
          </ScrollView>
        </View>

        {hasRecall && (
          <View style={styles.recallWarning}>
            <MaterialIcons name="warning" size={14} color={Colors.orange} />
            <Text style={styles.recallWarningText}>
              {displayRecalls} active NHTSA recall{displayRecalls > 1 ? 's' : ''} — verify at nhtsa.gov
            </Text>
          </View>
        )}

        <View style={styles.rvCardActions}>
          <Pressable
            style={({ pressed }) => [styles.detailsBtn, pressed && styles.detailsBtnPressed]}
            onPress={onViewDetails}
          >
            <MaterialIcons name="info" size={15} color="#000" />
            <Text style={styles.detailsBtnText}>Details</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [styles.reportBtn, pressed && styles.reportBtnPressed]}
            onPress={onGeneratePDF}
          >
            <MaterialIcons name="picture-as-pdf" size={15} color="#000" />
            <Text style={styles.reportBtnText}>PDF</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [styles.calBtn, pressed && { opacity: 0.75, transform: [{ scale: 0.97 }] }]}
            onPress={onOpenCal}
          >
            <Text style={styles.calBtnText}>RvCal</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [styles.grokBtn, pressed && { opacity: 0.75, transform: [{ scale: 0.97 }] }]}
            onPress={onOpenGrok}
          >
            <Text style={styles.grokBtnText}>RvGrok</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

function SpecChip({ icon, label, wide }: { icon: string; label: string; wide?: boolean }) {
  return (
    <View style={[styles.specChip, wide && styles.specChipWide]}>
      <MaterialIcons name={icon as any} size={11} color={Colors.blueBright} />
      <Text style={styles.specChipText} numberOfLines={1}>{label}</Text>
    </View>
  );
}

// ─── PHONE ENTRY MODAL ───────────────────────────────────────────────────────

function PhoneEntryModal({
  visible, onSave, onClose, saving,
}: {
  visible: boolean;
  onSave: (phone: string) => Promise<void>;
  onClose: () => void;
  saving: boolean;
}) {
  const [rawPhone, setRawPhone] = useState('');

  const formatted = rawPhone.replace(/\D/g, '').replace(/^(\d{3})(\d{3})(\d{4})$/, '($1) $2-$3');
  const digits = rawPhone.replace(/\D/g, '');
  const isValid = digits.length === 10;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.75)' }}
      >
        <View style={phoneModal.sheet}>
          <View style={phoneModal.handle} />
          <View style={phoneModal.iconWrap}>
            <MaterialIcons name="phone" size={28} color={Colors.blueBright} />
          </View>
          <Text style={phoneModal.title}>Enter Your Phone Number</Text>
          <Text style={phoneModal.sub}>
            Your phone number is used to verify dealer access.{"\n"}Enter the number your administrator registered.
          </Text>
          <TextInput
            style={phoneModal.input}
            value={rawPhone}
            onChangeText={setRawPhone}
            placeholder="(555) 000-0000"
            placeholderTextColor={Colors.textMuted}
            keyboardType="phone-pad"
            maxLength={14}
          />
          {rawPhone.length > 0 && (
            <Text style={[phoneModal.preview, isValid && { color: Colors.green }]}>
              {isValid ? formatted : `${digits.length}/10 digits`}
            </Text>
          )}
          <Pressable
            style={({ pressed }) => [
              phoneModal.saveBtn,
              !isValid && phoneModal.saveBtnDisabled,
              pressed && isValid && { opacity: 0.85, transform: [{ scale: 0.98 }] },
            ]}
            onPress={() => isValid && onSave(digits)}
            disabled={!isValid || saving}
          >
            {saving ? (
              <ActivityIndicator color="#000" size="small" />
            ) : (
              <Text style={phoneModal.saveBtnText}>Verify Access</Text>
            )}
          </Pressable>
          <Pressable onPress={onClose} style={{ marginTop: 8 }} hitSlop={8}>
            <Text style={phoneModal.cancelText}>Cancel — sign out and try later</Text>
          </Pressable>
          <View style={phoneModal.infoRow}>
            <MaterialIcons name="info-outline" size={12} color={Colors.textMuted} />
            <Text style={phoneModal.infoText}>
              Not registered? Contact contact@rvfox.app to request access.
            </Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ─── ACCESS GATE ─────────────────────────────────────────────────────────────

type AccessStatus = 'loading' | 'allowed' | 'denied';

function AccessDeniedCard({ phone }: { phone: string }) {
  return (
    <View style={gate.container}>
      <View style={gate.lockCircle}>
        <MaterialIcons name="lock" size={40} color={Colors.red} />
      </View>
      <Text style={gate.title}>Access Restricted</Text>
      <Text style={gate.sub}>
        Your phone number is not on the authorized access list for RvFax.
      </Text>
      {phone ? (
        <View style={gate.phoneBadge}>
          <MaterialIcons name="phone" size={14} color={Colors.textMuted} />
          <Text style={gate.phoneText}>{phone}</Text>
        </View>
      ) : null}
      <View style={gate.divider} />
      <Text style={gate.contactLabel}>Need access? Contact us:</Text>
      <Pressable
        style={({ pressed }) => [gate.emailBtn, pressed && gate.emailBtnPressed]}
        onPress={() => Linking.openURL('mailto:contact@rvfox.app')}
      >
        <MaterialIcons name="email" size={18} color="#000" />
        <Text style={gate.emailBtnText}>contact@rvfox.app</Text>
      </Pressable>
      <View style={gate.infoRow}>
        <MaterialIcons name="info-outline" size={12} color={Colors.textMuted} />
        <Text style={gate.infoText}>
          Your dealer or administrator can add your number to the allow list.
        </Text>
      </View>
    </View>
  );
}

// ─── MAIN SCREEN ─────────────────────────────────────────────────────────────

export default function RvFaxScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuth();

  const [accessStatus, setAccessStatus] = useState<AccessStatus>('loading');
  const [userPhone, setUserPhone] = useState('');
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [savingPhone, setSavingPhone] = useState(false);
  const [catalogReady, setCatalogReady] = useState(isCatalogLoaded());

  // Lazy-load the full seed, then merge overnight rows from the daily catalog-sync job.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await ensureCatalogLoaded();
        await refreshCatalogFromServer().catch(() => {});
      } finally {
        if (!cancelled) setCatalogReady(true);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Phase 1: never leave Facts on a black/loading screen — hard timeout on network gates
  const ACCESS_TIMEOUT_MS = 2500;

  const withTimeout = useCallback(async <T,>(promise: Promise<T>, ms: number = ACCESS_TIMEOUT_MS): Promise<T> => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    try {
      return await Promise.race([
        promise,
        new Promise<T>((_, reject) => {
          timer = setTimeout(() => reject(new Error('ACCESS_TIMEOUT')), ms);
        }),
      ]);
    } finally {
      if (timer) clearTimeout(timer);
    }
  }, []);

  const runAccessCheck = useCallback(async (phone: string) => {
    try {
      const supabase = getSupabaseClient();
      const result = await withTimeout(
        supabase
          .from('allowed_phones')
          .select('id')
          .eq('phone_number', phone)
          .maybeSingle()
      );
      const { data, error } = result as { data: { id: string } | null; error: unknown };
      setAccessStatus(!error && data ? 'allowed' : 'denied');
    } catch {
      // Timeout or network failure: fail-open for signed-in users so the shell stays usable
      setAccessStatus('allowed');
    }
  }, [withTimeout]);

  useEffect(() => {
    let cancelled = false;

    async function checkAccess() {
      setAccessStatus('loading');
      if (!user) {
        if (!cancelled) setAccessStatus('denied');
        return;
      }
      try {
        const supabase = getSupabaseClient();
        const profileResult = await withTimeout(
          supabase
            .from('user_profiles')
            .select('phone')
            .eq('id', user.id)
            .maybeSingle()
        );
        const profile = (profileResult as { data: { phone?: string } | null }).data;
        const phone: string = profile?.phone ?? '';
        if (cancelled) return;
        setUserPhone(phone);
        if (!phone) {
          // Show phone entry — do not spin forever if modal is dismissed
          setShowPhoneModal(true);
          setAccessStatus('denied');
          return;
        }
        await runAccessCheck(phone);
      } catch {
        // Profile fetch timed out / failed — paint the app rather than hang on black
        if (!cancelled) setAccessStatus('allowed');
      }
    }

    checkAccess();
    return () => { cancelled = true; };
  }, [user, runAccessCheck, withTimeout]);

  const handleSavePhone = useCallback(async (digits: string) => {
    setSavingPhone(true);
    try {
      const supabase = getSupabaseClient();
      const { error } = await supabase
        .from('user_profiles')
        .update({ phone: digits })
        .eq('id', user!.id);
      if (error) { Alert.alert('Error', 'Could not save phone number. Please try again.'); return; }
      setUserPhone(digits);
      setShowPhoneModal(false);
      await runAccessCheck(digits);
    } catch {
      Alert.alert('Error', 'Could not save phone number. Please try again.');
    } finally {
      setSavingPhone(false);
    }
  }, [user, runAccessCheck]);

  const [vinModalOpen, setVinModalOpen] = useState(false);
  const [year, setYear] = useState('');
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [floorplan, setFloorplan] = useState('');
  const [yearModalOpen, setYearModalOpen] = useState(false);

  // ── Era / Year Range Filter ──────────────────────────────────────────────
  type EraFilter = 'all' | 'classic' | 'recent' | 'modern';
  const [eraFilter, setEraFilter] = useState<EraFilter>('all');

  const ERA_OPTIONS: { id: EraFilter; label: string; range: string; color: string }[] = [
    { id: 'all',     label: 'All Years',    range: '2000–2027', color: Colors.blueBright },
    { id: 'classic', label: 'Classic Era',   range: '2000–2005', color: '#F4C430' },
    { id: 'recent',  label: 'Recent Era',    range: '2006–2010', color: '#FF8C00' },
    { id: 'modern',  label: 'Modern Era',    range: '2011+',     color: '#00E676' },
  ];

  const filteredYears = React.useMemo(() => {
    if (eraFilter === 'classic') return YEARS.filter(y => parseInt(y) >= 2000 && parseInt(y) <= 2005);
    if (eraFilter === 'recent')  return YEARS.filter(y => parseInt(y) >= 2006 && parseInt(y) <= 2010);
    if (eraFilter === 'modern')  return YEARS.filter(y => parseInt(y) >= 2011);
    return YEARS;
  }, [eraFilter]);

  const filteredMakes = React.useMemo(() => {
    if (eraFilter === 'classic') return MAKES; // classic era: show all makes including discontinued ones
    if (eraFilter === 'recent' || eraFilter === 'modern') return MAKES.filter(m => !CLASSIC_BRANDS.includes(m));
    return MAKES;
  }, [eraFilter]);
  const [makeModalOpen, setMakeModalOpen] = useState(false);
  const [modelModalOpen, setModelModalOpen] = useState(false);
  const [floorplanModalOpen, setFloorplanModalOpen] = useState(false);
  const [results, setResults] = useState<RVResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [savedRVs, setSavedRVs] = useState<RVResult[]>([]);
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([]);

  const availableModels = make ? Object.keys(RV_DATA[make] || {}).sort() : [];
  const availableFloorplans = make && model ? (RV_DATA[make]?.[model]?.floorplans ?? []) : [];

  const handleSearch = useCallback(() => {
    if (!make && !model) return;
    setSearching(true);
    setHasSearched(true);
    setTimeout(() => {
      const foundResults: RVResult[] = [];
      const makesToSearch = make ? [make] : MAKES;
      const searchYear = year ? parseInt(year, 10) : null;
      for (const m of makesToSearch) {
        const modelsMap = RV_DATA[m];
        if (!modelsMap) continue;
        const modelsToSearch = model ? [model] : Object.keys(modelsMap);
        for (const mod of modelsToSearch) {
          const spec = modelsMap[mod];
          if (!spec) continue;
          // Year existence validation — skip models that didn't exist in selected year
          if (searchYear) {
            if (spec.yearStart && searchYear < spec.yearStart) continue;
            if (spec.yearEnd && searchYear > spec.yearEnd) continue;
          }
          foundResults.push({
            year: year || '2025', make: m, model: mod, floorplan: floorplan || '',
            data: spec, saved: savedRVs.some(s => s.make === m && s.model === mod),
          });
        }
      }
      setResults(foundResults.slice(0, 8));
      setSearching(false);
      const label = `${year || 'Any'} ${make || 'Any'} ${model || 'Any'}`.trim();
      const sub = floorplan || 'All floorplans';
      setRecentSearches(prev =>
        [{ id: Date.now().toString(), label, sub }, ...prev.filter(r => r.label !== label)].slice(0, 5)
      );
    }, 800);
  }, [year, make, model, floorplan, savedRVs]);

  const toggleSave = useCallback((result: RVResult) => {
    setSavedRVs(prev => {
      const exists = prev.some(s => s.make === result.make && s.model === result.model && s.year === result.year);
      if (exists) return prev.filter(s => !(s.make === result.make && s.model === result.model && s.year === result.year));
      return [{ ...result, saved: true }, ...prev];
    });
    setResults(prev => prev.map(r =>
      r.make === result.make && r.model === result.model ? { ...r, saved: !r.saved } : r
    ));
  }, []);

  const DropdownField = ({
    label, value, placeholder, onPress, optional,
  }: {
    label: string; value: string; placeholder: string; onPress: () => void; optional?: boolean;
  }) => (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>
        {label}{optional ? <Text style={styles.optionalText}> OPTIONAL</Text> : null}
      </Text>
      <Pressable
        style={({ pressed }) => [
          styles.dropdownInput,
          value ? styles.dropdownInputFilled : null,
          pressed ? styles.dropdownInputPressed : null,
        ]}
        onPress={onPress}
      >
        <Text style={[styles.dropdownInputText, !value && styles.dropdownPlaceholder]}>
          {value || placeholder}
        </Text>
        <MaterialIcons name="keyboard-arrow-down" size={18} color={value ? Colors.silver : Colors.textMuted} />
      </Pressable>
    </View>
  );

  const HeaderBar = () => (
    <View style={styles.header}>
      <View style={styles.headerLeft}>
        <View style={styles.headerLogoWrap}>
          <Image source={require('@/assets/tab-logos-glow.jpg')} style={styles.headerLogoSprite} contentFit="cover" />
        </View>
        <View>
          <Text style={styles.headerTitle}>RvFax</Text>
          <Text style={styles.headerSub}>VERIFIED & TRUE</Text>
        </View>
      </View>
      <View style={styles.aiBadge}>
        <MaterialIcons name="auto-awesome" size={13} color={Colors.blueBright} />
        <Text style={styles.aiBadgeText}>AI-Powered</Text>
      </View>
    </View>
  );

  if (accessStatus === 'loading' || !catalogReady) {
    return (
      <View style={[styles.container, { paddingTop: insets.top, alignItems: 'center', justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color={Colors.blueBright} />
        <Text style={{ color: Colors.textMuted, fontSize: FontSize.sm, marginTop: 12 }}>
          {accessStatus === 'loading' ? 'Checking access...' : 'Loading RV catalog…'}
        </Text>
        <PhoneEntryModal
          visible={showPhoneModal}
          onSave={handleSavePhone}
          onClose={() => { setShowPhoneModal(false); setAccessStatus('denied'); }}
          saving={savingPhone}
        />
      </View>
    );
  }

  if (accessStatus === 'denied') {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <HeaderBar />
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: Spacing.md }}>
          <AccessDeniedCard phone={userPhone} />
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* HERO BACKDROP */}
      <View style={styles.heroBackdrop}>
        <Image
          source={require('@/assets/entegra-hero.png')}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          transition={400}
        />
        <LinearGradient
          colors={['rgba(8,8,8,0.45)', 'rgba(8,8,8,0.20)', 'rgba(8,8,8,0.18)', 'rgba(8,8,8,0.22)', 'rgba(8,8,8,0.40)']}
          locations={[0, 0.12, 0.45, 0.82, 1]}
          style={StyleSheet.absoluteFill}
        />
      </View>

      <HeaderBar />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
        <Pressable
          style={({ pressed }) => [styles.vinBadge, pressed && styles.vinBadgePressed]}
          onPress={() => setVinModalOpen(true)}
        >
          <View style={styles.vinBadgeLeft}>
            <View style={styles.vinBadgeIcon}>
              <MaterialIcons name="qr-code-scanner" size={20} color="#000" />
            </View>
            <View>
              <Text style={styles.vinBadgeTitle}>VIN Decoder</Text>
              <Text style={styles.vinBadgeSub}>Free · NHTSA · Any vehicle</Text>
            </View>
          </View>
          <View style={styles.vinBadgeRight}>
            <Text style={styles.vinBadgeTag}>17-CHAR VIN</Text>
            <MaterialIcons name="arrow-forward-ios" size={12} color="rgba(0,0,0,0.5)" />
          </View>
        </Pressable>

        <View style={styles.statBanner}>
          <View style={styles.statBannerItem}>
            <Text style={styles.statBannerValue}>2,400+</Text>
            <Text style={styles.statBannerLabel}>Coaches</Text>
          </View>
          <View style={styles.statBannerDivider} />
          <View style={styles.statBannerItem}>
            <View style={styles.statBannerIconRow}>
              <MaterialIcons name="warning" size={13} color={Colors.orange} />
              <Text style={[styles.statBannerValue, { color: Colors.orange }]}>NHTSA</Text>
            </View>
            <Text style={styles.statBannerLabel}>Recall Data</Text>
          </View>
          <View style={styles.statBannerDivider} />
          <View style={styles.statBannerItem}>
            <View style={styles.statBannerIconRow}>
              <MaterialIcons name="auto-awesome" size={13} color={Colors.blueBright} />
              <Text style={[styles.statBannerValue, { color: Colors.blueBright }]}>Live</Text>
            </View>
            <Text style={styles.statBannerLabel}>Market Data</Text>
          </View>
        </View>

        <View style={styles.searchCard}>
          <Text style={styles.searchCardTitle}>Search Any RV</Text>
          {/* ── Era / Year Range Filter Chips ── */}
          <View style={styles.eraSection}>
            <Text style={styles.eraLabel}>YEAR RANGE</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.eraChipRow}>
              {ERA_OPTIONS.map(era => {
                const active = eraFilter === era.id;
                return (
                  <Pressable
                    key={era.id}
                    style={({ pressed }) => [
                      styles.eraChip,
                      active && { backgroundColor: era.color, borderColor: era.color },
                      pressed && !active && { opacity: 0.7 },
                    ]}
                    onPress={() => {
                      setEraFilter(era.id);
                      // Auto-clear year if it falls outside the new era range
                      if (year) {
                        const y = parseInt(year);
                        if (era.id === 'classic' && (y < 2000 || y > 2005)) setYear('');
                        if (era.id === 'recent'  && (y < 2006 || y > 2010)) setYear('');
                        if (era.id === 'modern'  && y < 2011)                setYear('');
                      }
                      // Clear make if it is classic-only and a non-classic era is selected
                      if ((era.id === 'recent' || era.id === 'modern') && CLASSIC_BRANDS.includes(make)) {
                        setMake('');
                        setModel('');
                        setFloorplan('');
                      }
                    }}
                  >
                    <Text style={[styles.eraChipLabel, active && { color: '#000' }]}>{era.label}</Text>
                    <Text style={[styles.eraChipRange, active && { color: 'rgba(0,0,0,0.60)' }]}>{era.range}</Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>

          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <DropdownField label="YEAR" value={year} placeholder={eraFilter === 'classic' ? '2000–2005' : eraFilter === 'recent' ? '2006–2010' : '2026'} onPress={() => setYearModalOpen(true)} />
            </View>
            <View style={{ flex: 2 }}>
              <DropdownField label="MAKE" value={make} placeholder="Newmar, Tiffin..." onPress={() => setMakeModalOpen(true)} />
            </View>
          </View>
          <DropdownField
            label="MODEL"
            value={model}
            placeholder={make ? `Select ${make} model` : (eraFilter === 'classic' ? 'Inspire, Marquis, Conquest...' : 'King Aire, Allegro Bus...')}
            onPress={() => { if (make) setModelModalOpen(true); }}
          />
          <DropdownField
            label="FLOORPLAN"
            value={floorplan}
            placeholder="45OPP, 37TS..."
            onPress={() => { if (make && model) setFloorplanModalOpen(true); }}
            optional
          />
          <Pressable
            style={({ pressed }) => [
              styles.lookupButton,
              (!make && !model) && styles.lookupButtonDisabled,
              (pressed && (make || model)) ? styles.lookupButtonPressed : null,
            ]}
            onPress={handleSearch}
            disabled={searching || (!make && !model)}
          >
            {searching ? (
              <ActivityIndicator color="#000" size="small" />
            ) : (
              <>
                <MaterialIcons name="search" size={20} color={(!make && !model) ? Colors.textMuted : '#000000'} />
                <Text style={[styles.lookupButtonText, (!make && !model) && { color: Colors.textMuted }]}>
                  Lookup RV Specs
                </Text>
              </>
            )}
          </Pressable>
        </View>

        {hasSearched && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <MaterialIcons name="search" size={14} color={Colors.blueBright} />
                <Text style={styles.sectionTitle}>RESULTS</Text>
                {results.length > 0 && (
                  <View style={styles.countBadge}>
                    <Text style={styles.countText}>{results.length}</Text>
                  </View>
                )}
              </View>
            </View>
            {results.length === 0 && !searching && (
              <View style={styles.emptyState}>
                <MaterialIcons name="search-off" size={32} color={Colors.textDim} />
                <Text style={styles.emptyText}>No RVs found</Text>
                <Text style={styles.emptySubText}>Try a different make or model</Text>
              </View>
            )}
            {results.map((r, i) => (
              <RVCard
                key={`${r.make}-${r.model}-${i}`}
                result={r}
                onToggleSave={() => toggleSave(r)}
                onViewDetails={() => router.push({
                  pathname: '/rv-detail',
                  params: { year: r.year, make: r.make, model: r.model, floorplan: r.floorplan },
                })}
                onGeneratePDF={async () => {
                  try {
                    await generateAndShareRVReport({ ...r.data, year: r.year, make: r.make, model: r.model, floorplan: r.floorplan });
                  } catch {
                    Alert.alert('PDF Error', 'Could not generate report. Please try again.');
                  }
                }}
                onOpenCal={() => router.push({
                  pathname: '/(tabs)/rvcal',
                  params: { msrp: String(r.data.msrpRange[0]) },
                })}
                onOpenGrok={() => router.push({
                  pathname: '/(tabs)/rvgrok',
                  params: { prefill: `Tell me everything about the ${r.year} ${r.make} ${r.model} — specs, pricing, known issues, best floorplans, towing, maintenance, and what owners are saying.` },
                })}
              />
            ))}
          </View>
        )}

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <MaterialIcons name="favorite" size={14} color={Colors.red} />
              <Text style={styles.sectionTitle}>SAVED RVs</Text>
              {savedRVs.length > 0 && (
                <View style={[styles.countBadge, { backgroundColor: Colors.red }]}>
                  <Text style={styles.countText}>{savedRVs.length}</Text>
                </View>
              )}
            </View>
            {savedRVs.length > 0 && (
              <Pressable onPress={() => setSavedRVs([])}>
                <Text style={styles.linkText}>Clear all</Text>
              </Pressable>
            )}
          </View>
          {savedRVs.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialIcons name="bookmark-border" size={32} color={Colors.textDim} />
              <Text style={styles.emptyText}>No saved RVs yet</Text>
              <Text style={styles.emptySubText}>Search and tap the heart to save</Text>
            </View>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={{ flexDirection: 'row', gap: 12, paddingRight: Spacing.md }}>
                {savedRVs.map((rv, i) => (
                  <Pressable
                    key={i}
                    style={styles.savedCard}
                    onPress={() => router.push({
                      pathname: '/rv-detail',
                      params: { year: rv.year, make: rv.make, model: rv.model, floorplan: rv.floorplan },
                    })}
                  >
                    <Image source={require('@/assets/entegra-hero.png')} style={styles.savedCardImage} contentFit="cover" transition={200} />
                    <View style={styles.savedCardTypeBadge}>
                      <Text style={styles.savedCardTypeText}>{rv.data.type.split(' ')[0]}</Text>
                    </View>
                    <View style={styles.savedCardBody}>
                      <Text style={styles.savedCardYear}>{rv.year}</Text>
                      <Text style={styles.savedCardName} numberOfLines={2}>{rv.make} {rv.model}</Text>
                      <View style={styles.savedCardRating}>
                        <MaterialIcons name="star" size={11} color={Colors.silver} />
                        <Text style={styles.savedCardRatingText}>{computeRating(rv.make, rv.model, rv.year).toFixed(1)}</Text>
                      </View>
                      <Text style={styles.savedCardPrice}>
                        ${rv.data.msrpRange[0].toLocaleString()}–${rv.data.msrpRange[1].toLocaleString()}
                      </Text>
                      <View style={styles.savedCardActions}>
                        <Pressable
                          style={({ pressed }) => [styles.savedReportBtn, pressed && { opacity: 0.75 }]}
                          onPress={async (e) => {
                            e.stopPropagation?.();
                            try {
                              await generateAndShareRVReport({ ...rv.data, year: rv.year, make: rv.make, model: rv.model, floorplan: rv.floorplan });
                            } catch {
                              Alert.alert('PDF Error', 'Could not generate report.');
                            }
                          }}
                        >
                          <MaterialIcons name="picture-as-pdf" size={12} color="#000" />
                          <Text style={styles.savedReportText}>Report</Text>
                        </Pressable>
                        <Pressable
                          onPress={(e) => {
                            e.stopPropagation?.();
                            setSavedRVs(prev => prev.filter((_, j) => j !== i));
                          }}
                          hitSlop={6}
                        >
                          <View style={styles.savedHeartBtn}>
                            <MaterialIcons name="favorite" size={14} color={Colors.red} />
                          </View>
                        </Pressable>
                      </View>
                    </View>
                  </Pressable>
                ))}
              </View>
            </ScrollView>
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <MaterialIcons name="history" size={14} color={Colors.blueBright} />
              <Text style={styles.sectionTitle}>RECENT SEARCHES</Text>
            </View>
            {recentSearches.length > 0 && (
              <Pressable onPress={() => setRecentSearches([])}>
                <Text style={styles.linkText}>Clear</Text>
              </Pressable>
            )}
          </View>
          {recentSearches.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialIcons name="manage-search" size={28} color={Colors.textDim} />
              <Text style={styles.emptyText}>No recent searches</Text>
            </View>
          ) : (
            <View style={{ gap: 8 }}>
              {recentSearches.map(rs => (
                <Pressable
                  key={rs.id}
                  style={({ pressed }) => [styles.recentItem, pressed && { opacity: 0.7 }]}
                >
                  <MaterialIcons name="manage-search" size={18} color={Colors.blueBright} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.recentLabel}>{rs.label}</Text>
                    <Text style={styles.recentSub}>{rs.sub}</Text>
                  </View>
                  <Pressable onPress={() => setRecentSearches(prev => prev.filter(r => r.id !== rs.id))} hitSlop={8}>
                    <MaterialIcons name="close" size={16} color={Colors.textMuted} />
                  </Pressable>
                </Pressable>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      <VinDecoderModal visible={vinModalOpen} onClose={() => setVinModalOpen(false)} />
      <DropdownModal visible={yearModalOpen} title={eraFilter === 'classic' ? 'Select Year (Classic 2000–2005)' : eraFilter === 'recent' ? 'Select Year (Recent 2006–2010)' : eraFilter === 'modern' ? 'Select Year (Modern 2011+)' : 'Select Year'} items={filteredYears} selected={year}
        onSelect={setYear} onClose={() => setYearModalOpen(false)} allowFreeText />
      <DropdownModal visible={makeModalOpen} title={eraFilter === 'classic' ? 'Select Make (incl. Classic Brands)' : 'Select Make'} items={filteredMakes} selected={make}
        onSelect={(val) => { setMake(val); setModel(''); setFloorplan(''); }} onClose={() => setMakeModalOpen(false)} allowFreeText />
      <DropdownModal visible={modelModalOpen} title={`Select ${make} Model`} items={availableModels} selected={model}
        onSelect={(val) => { setModel(val); setFloorplan(''); }} onClose={() => setModelModalOpen(false)} allowFreeText />
      <DropdownModal visible={floorplanModalOpen} title="Select Floorplan" items={availableFloorplans} selected={floorplan}
        onSelect={setFloorplan} onClose={() => setFloorplanModalOpen(false)} allowFreeText />
    </View>
  );
}

// ─── STYLES ─────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.black,
  },
  heroBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    zIndex: 2,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  headerLogoWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: Colors.borderBlue,
  },
  headerLogoSprite: {
    width: 40,
    height: 40,
  },
  headerTitle: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.extrabold,
    color: Colors.textPrimary,
    letterSpacing: 0.5,
  },
  headerSub: {
    fontSize: 9,
    fontWeight: FontWeight.bold,
    color: Colors.textMuted,
    letterSpacing: 1.5,
  },
  aiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,104,192,0.12)',
    borderWidth: 1,
    borderColor: Colors.borderBlue,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: Radius.full,
  },
  aiBadgeText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    color: Colors.blueBright,
  },
  // VIN Banner
  vinBadge: {
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    backgroundColor: Colors.blueBright,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    zIndex: 2,
    shadowColor: Colors.blueBright,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 5,
  },
  vinBadgePressed: {
    opacity: 0.88,
    transform: [{ scale: 0.98 }],
  },
  vinBadgeLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  vinBadgeIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  vinBadgeTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: '#000',
  },
  vinBadgeSub: {
    fontSize: FontSize.xs,
    color: 'rgba(0,0,0,0.55)',
    fontWeight: FontWeight.medium,
  },
  vinBadgeRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  vinBadgeTag: {
    fontSize: 9,
    fontWeight: FontWeight.bold,
    color: 'rgba(0,0,0,0.5)',
    letterSpacing: 0.5,
  },
  statBanner: {
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
    backgroundColor: 'rgba(4,8,22,0.80)',
    borderRadius: Radius.xl,
    borderWidth: 1.5,
    borderColor: 'rgba(77,166,255,0.45)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    zIndex: 2,
    shadowColor: Colors.blueBright,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.22,
    shadowRadius: 12,
    elevation: 4,
  },
  statBannerItem: {
    flex: 1,
    alignItems: 'center',
    gap: 3,
  },
  statBannerIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statBannerValue: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.extrabold,
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  statBannerLabel: {
    fontSize: 10,
    color: Colors.textMuted,
    fontWeight: FontWeight.medium,
    letterSpacing: 0.3,
  },
  statBannerDivider: {
    width: 1,
    height: 32,
    backgroundColor: 'rgba(77,166,255,0.25)',
  },
  // Search card
  searchCard: {
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
    backgroundColor: 'rgba(0,0,0,0.35)',
    borderRadius: Radius.xl,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    zIndex: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
    gap: Spacing.sm,
  },
  eraSection: {
    gap: 6,
  },
  eraLabel: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    color: 'rgba(255,255,255,0.60)',
    letterSpacing: 1.2,
  },
  eraChipRow: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 2,
  },
  eraChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: Radius.full,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    minWidth: 80,
  },
  eraChipLabel: {
    fontSize: 11,
    fontWeight: FontWeight.bold,
    color: Colors.textSecondary,
    letterSpacing: 0.3,
    textAlign: 'center',
  },
  eraChipRange: {
    fontSize: 9,
    color: Colors.textDim,
    marginTop: 1,
    textAlign: 'center',
  },
  searchCardTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.extrabold,
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  inputGroup: {
    marginBottom: Spacing.sm,
  },
  inputLabel: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    color: '#FFFFFF',
    letterSpacing: 1,
    marginBottom: 5,
  },
  optionalText: {
    color: 'rgba(255,255,255,0.45)',
    fontWeight: FontWeight.medium,
  },
  dropdownInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.bgCardAlt,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 13,
    gap: 8,
  },
  dropdownInputFilled: {
    borderColor: Colors.borderBlue,
    backgroundColor: 'rgba(0,104,192,0.06)',
    shadowColor: Colors.blue,
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  dropdownInputPressed: {
    borderColor: Colors.borderBlueBright,
    backgroundColor: 'rgba(0,104,192,0.1)',
  },
  dropdownInputText: {
    flex: 1,
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
    color: '#FFFFFF',
  },
  dropdownPlaceholder: {
    color: 'rgba(255,255,255,0.50)',
    fontWeight: FontWeight.regular,
  },
  lookupButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.blueBright,
    borderRadius: Radius.md,
    paddingVertical: 15,
    marginTop: 4,
    shadowColor: Colors.blue,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.45,
    shadowRadius: 10,
    elevation: 6,
  },
  lookupButtonDisabled: {
    backgroundColor: Colors.bgCardAlt,
    shadowOpacity: 0,
    elevation: 0,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  lookupButtonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  lookupButtonText: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.bold,
    color: '#000',
  },
  // Sections
  section: {
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.md,
    zIndex: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  sectionTitle: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    color: Colors.textSecondary,
    letterSpacing: 1.5,
  },
  countBadge: {
    backgroundColor: Colors.blue,
    borderRadius: Radius.full,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  countText: {
    fontSize: 9,
    fontWeight: FontWeight.bold,
    color: '#fff',
  },
  linkText: {
    fontSize: FontSize.sm,
    color: Colors.blueBright,
    fontWeight: FontWeight.medium,
  },
  // RV Card
  rvCard: {
    backgroundColor: 'rgba(0,0,0,0.30)',
    borderRadius: Radius.xl,
    marginBottom: Spacing.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.borderSilver,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
  },
  rvCardImageWrapper: {
    height: 180,
    backgroundColor: '#0A0A12',
    position: 'relative',
  },
  rvCardTypeBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: 'rgba(0,104,192,0.85)',
    borderRadius: Radius.sm,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  rvCardTypeText: {
    fontSize: 10,
    fontWeight: FontWeight.bold,
    color: '#fff',
    letterSpacing: 0.5,
  },
  recallBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: Colors.warning,
    borderRadius: Radius.sm,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  recallBadgeText: {
    fontSize: 10,
    fontWeight: FontWeight.bold,
    color: '#000',
  },
  noRecallBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(0,0,0,0.65)',
    borderRadius: Radius.sm,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: 'rgba(58,181,114,0.4)',
  },
  noRecallBadgeText: {
    fontSize: 10,
    fontWeight: FontWeight.bold,
    color: Colors.textSecondary,
  },
  tapHint: {
    position: 'absolute',
    bottom: 8,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  tapHintText: {
    fontSize: 9,
    color: 'rgba(255,255,255,0.45)',
  },
  rvCardBody: {
    padding: Spacing.md,
  },
  rvCardTitleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  rvCardYear: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    color: Colors.blueBright,
    letterSpacing: 1,
  },
  rvCardName: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.extrabold,
    color: '#FFFFFF',
    marginTop: 1,
  },
  rvCardFloorplan: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    marginTop: 2,
  },
  heartBtn: {
    padding: 4,
  },
  rvCardRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 10,
  },
  rvCardRating: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.silver,
    marginRight: 6,
  },
  rvCardPrice: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.green,
  },
  specsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 10,
  },
  specChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,104,192,0.1)',
    borderWidth: 1,
    borderColor: Colors.borderBlue,
    borderRadius: Radius.sm,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  specChipWide: {
    flex: 1,
  },
  specChipText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.medium,
    color: Colors.textSecondary,
  },
  floorplanRow: {
    marginBottom: 10,
  },
  floorplanLabel: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    color: Colors.textMuted,
    letterSpacing: 0.5,
  },
  fpChip: {
    backgroundColor: 'rgba(188,185,186,0.08)',
    borderWidth: 1,
    borderColor: Colors.borderSilver,
    borderRadius: Radius.sm,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  fpChipText: {
    fontSize: FontSize.xs,
    color: Colors.silver,
    fontWeight: FontWeight.semibold,
  },
  recallWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(200,146,42,0.1)',
    borderRadius: Radius.sm,
    paddingHorizontal: 10,
    paddingVertical: 7,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(200,146,42,0.3)',
  },
  recallWarningText: {
    flex: 1,
    fontSize: FontSize.xs,
    color: Colors.warning,
    fontWeight: FontWeight.medium,
  },
  rvCardActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  detailsBtn: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    backgroundColor: Colors.blueBright,
    borderRadius: Radius.md,
    paddingVertical: 10,
    shadowColor: Colors.blue,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 4,
  },
  detailsBtnPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.97 }],
  },
  detailsBtnText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: '#000',
  },
  reportBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    backgroundColor: Colors.silver,
    borderRadius: Radius.md,
    paddingVertical: 10,
  },
  reportBtnPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.97 }],
  },
  reportBtnText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: '#000',
  },
  calBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(188,185,186,0.12)',
    borderWidth: 1,
    borderColor: Colors.borderSilver,
    borderRadius: Radius.md,
    paddingVertical: 10,
  },
  calBtnText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    color: Colors.silver,
  },
  grokBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,104,192,0.12)',
    borderWidth: 1,
    borderColor: Colors.borderBlue,
    borderRadius: Radius.md,
    paddingVertical: 10,
  },
  grokBtnText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    color: Colors.blueBright,
  },
  // Saved card
  savedCard: {
    width: 160,
    backgroundColor: 'transparent',
    borderRadius: Radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  savedCardImage: {
    width: '100%',
    height: 100,
    backgroundColor: '#0A0A12',
  },
  savedCardTypeBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(0,104,192,0.85)',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  savedCardTypeText: {
    fontSize: 9,
    fontWeight: FontWeight.bold,
    color: '#fff',
  },
  savedCardBody: {
    padding: Spacing.sm,
  },
  savedCardYear: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    color: Colors.blueBright,
    letterSpacing: 1,
  },
  savedCardName: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: '#FFFFFF',
    marginTop: 2,
    lineHeight: 17,
  },
  savedCardRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 5,
  },
  savedCardRatingText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    color: Colors.silver,
  },
  savedCardPrice: {
    fontSize: FontSize.xs,
    color: Colors.green,
    fontWeight: FontWeight.semibold,
    marginTop: 3,
  },
  savedCardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  savedReportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.silver,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  savedReportText: {
    fontSize: 10,
    fontWeight: FontWeight.bold,
    color: '#000',
  },
  savedHeartBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(184,58,58,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(184,58,58,0.3)',
  },
  // Recent searches
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: 'transparent',
    borderRadius: Radius.md,
    padding: Spacing.sm + 2,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  recentLabel: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: '#FFFFFF',
  },
  recentSub: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    marginTop: 1,
  },
  // Modals
  modalSheet: {
    backgroundColor: Colors.bgDeep,
    borderTopLeftRadius: Radius.xxl,
    borderTopRightRadius: Radius.xxl,
    borderTopWidth: 2,
    borderColor: Colors.borderBlue,
    maxHeight: '90%',
    paddingHorizontal: Spacing.md,
    paddingTop: 8,
    shadowColor: Colors.blue,
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.35,
    shadowRadius: 24,
    elevation: 20,
  },
  modalHandle: {
    width: 36,
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: Spacing.sm,
    marginTop: 4,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    marginBottom: Spacing.sm,
  },
  modalTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.extrabold,
    color: '#FFFFFF',
  },
  modalSearchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.bgCard,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    marginBottom: Spacing.sm,
  },
  modalSearchInput: {
    flex: 1,
    fontSize: FontSize.md,
    color: Colors.textPrimary,
  },
  modalManualEntry: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: 'rgba(0,104,192,0.08)',
    borderWidth: 1,
    borderColor: Colors.borderBlue,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    marginBottom: 8,
  },
  modalManualEntryText: {
    flex: 1,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  modalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalItemSelected: {
    backgroundColor: 'rgba(0,104,192,0.08)',
  },
  modalItemText: {
    fontSize: FontSize.md,
    color: 'rgba(255,255,255,0.80)',
    fontWeight: FontWeight.medium,
  },
  modalItemTextSelected: {
    color: Colors.blueBright,
    fontWeight: FontWeight.bold,
  },
  modalEmpty: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
    gap: Spacing.sm,
  },
  modalEmptyText: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
  },
  // Empty state
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
    gap: Spacing.sm,
    backgroundColor: 'transparent',
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
  },
  emptyText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: '#FFFFFF',
  },
  emptySubText: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
  },
});

// ─── VIN MODAL STYLES ────────────────────────────────────────────────────────

const vinModal = StyleSheet.create({
  sheet: {
    backgroundColor: Colors.bgDeep,
    borderTopLeftRadius: Radius.xxl,
    borderTopRightRadius: Radius.xxl,
    borderTopWidth: 2,
    borderColor: Colors.borderBlue,
    maxHeight: '92%',
    paddingHorizontal: Spacing.md,
    paddingTop: 8,
    shadowColor: Colors.blue,
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.35,
    shadowRadius: 24,
    elevation: 20,
  },
  handle: {
    width: 36,
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: Spacing.sm,
    marginTop: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    marginBottom: Spacing.sm,
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.extrabold,
    color: '#FFFFFF',
  },
  inputSection: {
    paddingVertical: Spacing.sm,
  },
  inputRow: {
    position: 'relative',
    marginBottom: Spacing.sm,
  },
  input: {
    backgroundColor: Colors.bgCard,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 13,
    paddingRight: 52,
    fontSize: FontSize.md,
    color: '#FFFFFF',
    fontWeight: FontWeight.bold,
    letterSpacing: 2,
  },
  charCount: {
    position: 'absolute',
    right: Spacing.md,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
  charCountText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    color: Colors.textMuted,
    letterSpacing: 0.5,
  },
  actionRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: 8,
  },
  decodeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: Colors.blue,
    borderRadius: Radius.md,
    paddingVertical: 13,
    shadowColor: Colors.blue,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 5,
  },
  decodeBtnDisabled: {
    backgroundColor: Colors.bgCardAlt,
    shadowOpacity: 0,
    elevation: 0,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  decodeBtnText: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.bold,
    color: Colors.silverBright,
  },
  scanBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: 'rgba(0,104,192,0.12)',
    borderWidth: 1.5,
    borderColor: Colors.borderBlueBright,
    borderRadius: Radius.md,
    paddingVertical: 13,
    paddingHorizontal: 18,
  },
  scanBtnText: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.bold,
    color: Colors.blueBright,
  },
  scanHintRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 4,
  },
  scanHintText: {
    flex: 1,
    fontSize: FontSize.xs,
    color: Colors.textDim,
    lineHeight: 15,
  },
  errorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: 'rgba(184,58,58,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(184,58,58,0.3)',
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  errorText: {
    flex: 1,
    fontSize: FontSize.sm,
    color: Colors.red,
    fontWeight: FontWeight.medium,
  },
  results: {
    gap: Spacing.sm,
  },
  identityCard: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.borderSilver,
    gap: Spacing.sm,
  },
  identityTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  identityYear: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    color: Colors.blueBright,
    letterSpacing: 2,
    marginBottom: 2,
  },
  identityName: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.extrabold,
    color: '#FFFFFF',
  },
  identityTrim: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  recallLoadingBadge: {
    backgroundColor: 'rgba(0,104,192,0.1)',
    borderRadius: Radius.sm,
    padding: 6,
    borderWidth: 1,
    borderColor: Colors.borderBlue,
  },
  recallCountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: Colors.warning,
    borderRadius: Radius.sm,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  recallCountText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    color: '#000',
  },
  noRecallBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(58,181,114,0.12)',
    borderRadius: Radius.sm,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: 'rgba(58,181,114,0.3)',
  },
  noRecallText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.medium,
    color: Colors.green,
  },
  identityBadges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(188,185,186,0.08)',
    borderRadius: Radius.sm,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: Colors.borderSilver,
  },
  badgeText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.medium,
    color: Colors.textSecondary,
  },
  vinChip: {
    backgroundColor: Colors.bgCardAlt,
    borderRadius: Radius.sm,
    padding: Spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  vinChipLabel: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    color: Colors.blueBright,
    letterSpacing: 1,
  },
  vinChipText: {
    flex: 1,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: '#FFFFFF',
    letterSpacing: 1.5,
  },
  sectionBlock: {
    gap: Spacing.sm,
  },
  sectionBlockTitle: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    color: Colors.textSecondary,
    letterSpacing: 1.5,
  },
  detailGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  detailCell: {
    width: '47%',
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.sm,
    padding: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 3,
  },
  detailCellLabel: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    color: Colors.textMuted,
    letterSpacing: 0.5,
  },
  detailCellValue: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
  },
  assemblyCard: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.sm,
    padding: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 3,
  },
  assemblyValue: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.silver,
    letterSpacing: 1,
  },
  recallSection: {
    backgroundColor: 'rgba(200,146,42,0.06)',
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(200,146,42,0.25)',
    gap: 8,
  },
  recallSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  recallSectionTitle: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    color: Colors.warning,
    letterSpacing: 1,
  },
  recallItem: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: Radius.sm,
    padding: Spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(200,146,42,0.2)',
  },
  recallItemMain: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  recallItemLeft: {
    flex: 1,
    gap: 3,
  },
  recallComponent: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
  },
  recallDate: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
  recallSummary: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    lineHeight: 16,
    marginTop: 4,
  },
  recallRemedyRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 4,
    marginTop: 4,
  },
  recallRemedy: {
    flex: 1,
    fontSize: FontSize.xs,
    color: Colors.green,
    lineHeight: 16,
  },
  noRecallSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(58,181,114,0.08)',
    borderRadius: Radius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(58,181,114,0.25)',
  },
  noRecallSectionText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: Colors.green,
  },
  nhtsaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.borderBlue,
    backgroundColor: 'rgba(0,104,192,0.06)',
  },
  nhtsaBtnText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: Colors.blueBright,
  },
  lookupBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.blue,
    borderRadius: Radius.md,
    padding: Spacing.md,
    shadowColor: Colors.blue,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 5,
  },
  lookupBtnTitle: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.extrabold,
    color: Colors.silverBright,
  },
  lookupBtnSub: {
    fontSize: FontSize.xs,
    color: 'rgba(188,185,186,0.6)',
    marginTop: 1,
  },
  disclaimer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 5,
    paddingHorizontal: 4,
  },
  disclaimerText: {
    flex: 1,
    fontSize: FontSize.xs,
    color: Colors.textDim,
    lineHeight: 15,
  },
  // Scanner
  scannerContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  scanCorner: {
    position: 'absolute',
    width: 22,
    height: 22,
    borderWidth: 3,
    borderColor: Colors.blueBright,
  },
  scannerBottomUi: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: Spacing.xl,
    alignItems: 'center',
    gap: Spacing.sm,
  },
  scannerHint: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: '#fff',
    textAlign: 'center',
  },
  scannerHint2: {
    fontSize: FontSize.sm,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
  },
  scannerCloseBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.silver,
    borderRadius: Radius.full,
    paddingHorizontal: 24,
    paddingVertical: 13,
    marginTop: Spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  scannerCloseBtnText: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.bold,
    color: '#000',
  },
});

// ─── PHONE MODAL STYLES ─────────────────────────────────────────────────────

const phoneModal = StyleSheet.create({
  sheet: {
    backgroundColor: Colors.bgDeep,
    borderTopLeftRadius: Radius.xxl,
    borderTopRightRadius: Radius.xxl,
    borderTopWidth: 2,
    borderColor: Colors.borderBlue,
    paddingHorizontal: Spacing.lg,
    paddingBottom: 32,
    paddingTop: 8,
    alignItems: 'center',
    shadowColor: Colors.blue,
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.35,
    shadowRadius: 24,
    elevation: 20,
  },
  handle: {
    width: 36,
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: 2,
    marginBottom: Spacing.md,
    marginTop: 4,
  },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(0,104,192,0.1)',
    borderWidth: 1.5,
    borderColor: Colors.borderBlue,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
    shadowColor: Colors.blueBright,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 5,
  },
  title: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.extrabold,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  sub: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: Spacing.md,
  },
  input: {
    width: '100%',
    backgroundColor: Colors.bgCard,
    borderWidth: 1.5,
    borderColor: Colors.borderBlue,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 15,
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: '#FFFFFF',
    letterSpacing: 2,
    textAlign: 'center',
    marginBottom: 8,
  },
  preview: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    marginBottom: Spacing.md,
    fontWeight: FontWeight.medium,
  },
  saveBtn: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.blueBright,
    borderRadius: Radius.md,
    paddingVertical: 16,
    marginTop: 4,
    shadowColor: Colors.blue,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 5,
  },
  saveBtnDisabled: {
    backgroundColor: Colors.bgCardAlt,
    shadowOpacity: 0,
    elevation: 0,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  saveBtnText: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.bold,
    color: '#000',
  },
  cancelText: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    fontWeight: FontWeight.medium,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 5,
    marginTop: Spacing.md,
    paddingHorizontal: 8,
  },
  infoText: {
    flex: 1,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    lineHeight: 16,
    textAlign: 'center',
  },
});

// ─── ACCESS GATE STYLES ───────────────────────────────────────────────────────

const gate = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(22,22,24,0.96)',
    borderRadius: Radius.xxl,
    padding: Spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.borderSilver,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
  },
  lockCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(184,58,58,0.1)',
    borderWidth: 1.5,
    borderColor: 'rgba(184,58,58,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.extrabold,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  sub: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: Spacing.md,
  },
  phoneBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.bgCardAlt,
    borderRadius: Radius.full,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.md,
  },
  phoneText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.textSecondary,
    letterSpacing: 1,
  },
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Spacing.md,
  },
  contactLabel: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  emailBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.blueBright,
    borderRadius: Radius.md,
    paddingVertical: 14,
    paddingHorizontal: Spacing.xl,
    shadowColor: Colors.blue,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 5,
  },
  emailBtnPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.97 }],
  },
  emailBtnText: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.bold,
    color: '#000',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 5,
    marginTop: Spacing.md,
    paddingHorizontal: 8,
  },
  infoText: {
    flex: 1,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    lineHeight: 16,
    textAlign: 'center',
  },
});