import { StyleSheet, Text, View, StatusBar, Platform, KeyboardAvoidingView, TouchableOpacity } from 'react-native'
import React, { useState, useEffect } from 'react'
import { useRouter } from "expo-router";
import { useRoute } from '@react-navigation/native';
import ScreenWrapper from "@/components/ScreenWrapper";
import BackButton from "@/components/BackButton";
import Button from "@/components/Button";
import Toast from 'react-native-toast-message';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { theme } from "@/constants/theme";
import { hp, wp } from "@/helpers/common";
import { API_URL } from '@/constants/constantes'

// Custom Checkbox Component
const CustomCheckbox = ({ checked, onToggle, label }) => {
  return (
    <TouchableOpacity
      style={styles.checkboxRow}
      onPress={onToggle}
      activeOpacity={0.7}
    >
      <View style={[
        styles.checkbox,
        checked && styles.checkboxChecked
      ]}>
        {checked && <View style={styles.checkboxInner} />}
      </View>
      <Text style={styles.checkboxLabel}>{label}</Text>
    </TouchableOpacity>
  );
};

const RechazoPallet = () => {
  const router = useRouter();
  const route = useRoute();
  const { folio, especie, cajas } = route.params;
  const [loading, setLoading] = useState(false);
  const [reasonsList, setReasonsList] = useState([]);
  const [loadingReasons, setLoadingReasons] = useState(true);

  // State for tracking selected rejection reasons
  const [rejectionReasons, setRejectionReasons] = useState({});

  // Fetch reasons from API
  useEffect(() => {
    const fetchReasons = async () => {
      setLoadingReasons(true);
      try {
        const response = await fetch(`${API_URL}/validacion/motivos-rechazo`);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const data = await response.json();
        // Process the data - usando el ID que viene directamente de la tabla
        const reasons = data.map(reason => ({
          id: reason.id_motivo,
          label: reason.nombre_motivo
        }));

        setReasonsList(reasons);

        // Initialize the rejection reasons state with the fetched data
        const initialReasons = {};
        reasons.forEach(reason => {
          initialReasons[reason.id] = false;
        });

        setRejectionReasons(initialReasons);
      } catch (error) {
        console.error('Error fetching rejection reasons:', error);
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'No se pudieron cargar los motivos de rechazo',
          position: 'top',
        });

        // En caso de error, establecer una lista vacía
        setReasonsList([]);

        // Inicializar rejection reasons como un objeto vacío
        setRejectionReasons({});
      } finally {
        setLoadingReasons(false);
      }
    };

    fetchReasons();
  }, []);

  // Handle checkbox toggle
  const toggleCheckbox = (id) => {
    setRejectionReasons(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Submit rejection with selected reasons
  const handleSubmitRejection = async () => {
    setLoading(true);
    // Get selected reasons
    const selectedReasons = Object.entries(rejectionReasons)
      .filter(([_, value]) => value)
      .map(([key, _]) => {
        // Encontrar el motivo completo para obtener su label e id
        const reason = reasonsList.find(r => r.id === parseInt(key) || r.id === key);
        return reason ? { id: reason.id, motivo: reason.label } : null;
      })
      .filter(reason => reason !== null); // Filtrar cualquier null que pudiera haberse generado

    if (selectedReasons.length === 0) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Seleccione al menos un motivo de rechazo',
        position: 'top',
      });
      setLoading(false);
      return;
    }

    try {
      // Replace with your API endpoint for rejection
      const response = await fetch(`${API_URL}/validacion/rechazar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          Folio: folio,
          Motivos: selectedReasons,
          Usuario: 'jason', // Replace with actual user
        }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      Toast.show({
        type: 'success',
        text1: 'Rechazo exitoso',
        text2: 'El pallet ha sido rechazado',
        position: 'top',
      });

      // Navigate back to validation screen
      setTimeout(() => {
        router.push('menu/validacion');
      }, 2000);

    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Ocurrió un error al rechazar el pallet',
        position: 'top',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenWrapper>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <KeyboardAwareScrollView
          contentContainerStyle={styles.container}
          enableOnAndroid={true}
          extraScrollHeight={Platform.OS === 'ios' ? 20 : 100}
        >
          <BackButton router={router} />

          <Text style={styles.welcomeText}>Folio: {folio || 'N/A'}</Text>
          
          <View style={styles.contentContainer}>
            <Text style={styles.title}>Motivos de Rechazo</Text>
            <Text style={styles.subtitle}>Seleccione los motivos por los cuales se rechaza el pallet:</Text>
            
            <View style={styles.checklistContainer}>
              {loadingReasons ? (
                <Text style={styles.loadingText}>Cargando motivos de rechazo...</Text>
              ) : reasonsList && reasonsList.length > 0 ? (
                reasonsList.map((reason) => (
                  <CustomCheckbox
                    key={reason.id}
                    checked={rejectionReasons[reason.id] || false}
                    onToggle={() => toggleCheckbox(reason.id)}
                    label={reason.label}
                  />
                ))
              ) : (
                <Text style={styles.loadingText}>No hay motivos de rechazo disponibles</Text>
              )}
            </View>
          </View>

          <View style={styles.buttonContainer}>
            <Button
              title="Cancelar"
              onPress={() => router.back()}
              buttonStyle={[styles.cancelButton, styles.buttonPadding]}
            />
            <Button
              title="Confirmar Rechazo"
              loading={loading}
              onPress={handleSubmitRejection}
              buttonStyle={[styles.confirmButton, styles.buttonPadding]}
              disabled={loadingReasons}
            />
          </View>
        </KeyboardAwareScrollView>
      </KeyboardAvoidingView>
      <Toast />
    </ScreenWrapper>
  )
}

export default RechazoPallet

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    gap: 30,
    paddingHorizontal: wp(5),
    paddingBottom: 20,
  },
  welcomeText: {
    fontSize: hp(4),
    fontWeight: theme.fonts.bold,
    color: theme.colors.text
  },
  contentContainer: {
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: hp(3),
    fontWeight: theme.fonts.bold,
    marginBottom: 10,
    color: theme.colors.primary
  },
  subtitle: {
    fontSize: hp(2),
    marginBottom: 20,
    color: theme.colors.text
  },
  checklistContainer: {
    gap: 12,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  checkboxLabel: {
    marginLeft: 10,
    fontSize: hp(1.8),
    color: theme.colors.text,
    flex: 1,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  cancelButton: {
    backgroundColor: '#999',
  },
  confirmButton: {
    backgroundColor: 'red',
  },
  buttonPadding: {
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  checkboxChecked: {
    backgroundColor: theme.colors.primary,
  },
  checkboxInner: {
    width: 10,
    height: 10,
    backgroundColor: 'white',
    borderRadius: 2,
  },
  loadingText: {
    fontSize: hp(2),
    color: theme.colors.text,
    textAlign: 'center',
  },
})
