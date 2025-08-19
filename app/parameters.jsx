import { Picker, StyleSheet, View, Text, StatusBar, Image, Platform, KeyboardAvoidingView } from "react-native";
import Toast from 'react-native-toast-message';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import React, { useEffect, useState,useContext } from "react";
import { useRouter } from "expo-router";
import ScreenWrapper from "../components/ScreenWrapper";
import { theme } from "../constants/theme";
import BackButton from "../components/BackButton";
import Button from "../components/Button";
import Icon from '../assets/icons';
import Input from "../components/Input";
import { Dropdown } from 'react-native-element-dropdown';
import AntDesign from '@expo/vector-icons/AntDesign';
import { hp, wp } from "../helpers/common";
import { ParametersContext } from "../context/ParametersContext";
import { API_URL } from '../constants/constantes'


const Parameters = () => {

  const {selectedFrio, setSelectedFrio, selectedCamara, setSelectedCamara } = useContext(ParametersContext);
  const [frios, setFrios] = useState([]);
  // const [selectedFrio, setSelectedFrio] = useState('');
  const [camaras, setCamaras] = useState([]);
  // const [selectedCamara, setSelectedCamara] = useState('');r
  const [isFocus1, setIsFocus1] = useState(false);
  const [isFocus2, setIsFocus2] = useState(false);


  useEffect(() => {
    // Fetch options for the first select
    fetch(`${API_URL}/frios`)
      .then(response => response.json())
      .then(data => setFrios(data))
      .catch(error => console.error('Error fetching frios:', error));
  }, []);

  useEffect(() => {
    if (selectedFrio) {
      // Fetch options for the second select based on the selected value of the first select
      fetch(`${API_URL}/camaras/${selectedFrio}`)
        .then(response => response.json())
        .then(data => setCamaras(data))
        .catch(error => console.error('Error fetching camaras:', error));
    }
  }, [selectedFrio]);

  const handleAccept = () => {
    if (!selectedFrio || !selectedCamara) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Debe seleccionar ambas opciones: Frigorifico y Paletizado.'
      });
      return;
    }
    router.push('/menu');
  };

  const renderLabel = (value, isFocus) => {
    if (value || isFocus) {
      return (
        <Text style={[styles.label, isFocus && { color: 'blue' }]}>
          Elegir opción
        </Text>
      );
    }
    return null;
  };

  const router = useRouter();

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

          {/* Bienvenido */}
          <Image source={require('../assets/images/logo_qf.webp')} style={styles.headerImg} />
          <View>
            <Text style={styles.welcomeText}>Parametros</Text>
          </View>
          {/* Formulario */}
          <View style={styles.form}>
            {renderLabel(selectedFrio, isFocus1)}
            <Dropdown
              style={[styles.dropdown, isFocus1 && { borderColor: 'blue' }]}
              placeholderStyle={styles.placeholderStyle}
              selectedTextStyle={styles.selectedTextStyle}
              inputSearchStyle={styles.inputSearchStyle}
              iconStyle={styles.iconStyle}
              data={frios.map(frio => ({ label: frio.NOM_FRI, value: frio.COD_FRI }))}
              search
              maxHeight={300}
              labelField="label"
              valueField="value"
              placeholder={!isFocus1 ? 'Seleccione Frigorifico ' : '...'}
              searchPlaceholder="Buscar..."
              value={selectedFrio}
              onFocus={() => setIsFocus1(true)}
              onBlur={() => setIsFocus1(false)}
              onChange={item => {
                setSelectedFrio(item.value);
                setIsFocus1(false);
              }}
              // renderLeftIcon={() => (
              //   <AntDesign
              //     style={styles.icon}
              //     color={isFocus1 ? 'blue' : 'black'}
              //     name="doubleright"
              //     size={20}
              //   />
              // )}
            />
            {renderLabel(selectedCamara, isFocus2)}
            <Dropdown
              style={[styles.dropdown, isFocus2 && { borderColor: 'blue' }]}
              placeholderStyle={styles.placeholderStyle}
              selectedTextStyle={styles.selectedTextStyle}
              inputSearchStyle={styles.inputSearchStyle}
              iconStyle={styles.iconStyle}
              data={camaras.map(camara => ({ label: camara.DES_CAM, value: camara.DES_CAM }))}
              search
              maxHeight={300}
              labelField="label"
              valueField="value"
              placeholder={!isFocus2 ? 'Seleccione Paletizado ' : '...'}
              searchPlaceholder="Buscar..."
              value={selectedCamara}
              onFocus={() => setIsFocus2(true)}
              onBlur={() => setIsFocus2(false)}
              onChange={item => {
                setSelectedCamara(item.value);
                setIsFocus2(false);
              }}
              // renderLeftIcon={() => (
              //   <AntDesign
              //     style={styles.icon}
              //     color={isFocus2 ? 'blue' : 'black'}
              //     name="doubleright"
              //     size={20}
              //   />
              // )}
            />
            <Button title="Aceptar" onPress={handleAccept} />
          </View>
        </KeyboardAwareScrollView>
      </KeyboardAvoidingView>
      <Toast />
    </ScreenWrapper>
  );
};

export default Parameters;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    gap: 45,
    paddingHorizontal: wp(5)
  },
  headerImg: {
    width: 150,
    height: 100,
    alignSelf: 'center',
    marginTop: -45,
  },
  welcomeText: {
    fontSize: hp(4),
    fontWeight: theme.fonts.bold,
    color: theme.colors.text
  },
  form: {
    gap: 25
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 5
  },
  footerText: {
    textAlign: 'center',
    color: theme.colors.text,
    fontSize: hp(1.6)
  },
  dropdown: {
    height: 50,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 16,
  },
  icon: {
    marginRight: 5,
  },
  item: {
    padding: 17,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectedStyle: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 14,
    backgroundColor: 'white',
    shadowColor: '#000',
    marginTop: 8,
    marginRight: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  textSelectedStyle: {
    marginRight: 5,
    fontSize: 16,
  },
});