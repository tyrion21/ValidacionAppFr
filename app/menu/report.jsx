import React, { useState, useEffect, useContext } from "react";
import { View, Text, Button, StatusBar, Platform, KeyboardAvoidingView, StyleSheet, ActivityIndicator, ScrollView } from "react-native";
import DateTimePicker from '@react-native-community/datetimepicker';
import Toast from 'react-native-toast-message';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useRouter } from "expo-router";
import ScreenWrapper from "../../components/ScreenWrapper";
import BackButton from "../../components/BackButton";
import { Dropdown } from 'react-native-element-dropdown';
import { ParametersContext } from "../../context/ParametersContext";
import { theme } from "../../constants/theme";
import { hp, wp } from "../../helpers/common";
import { API_URL } from '@/constants/constantes'

const Report = () => {
    const { selectedFrio, setSelectedFrio, selectedCamara, setSelectedCamara } = useContext(ParametersContext);
    const [date, setDate] = useState(new Date());
    const [show, setShow] = useState(false);
    const [camaras, setCamaras] = useState([]);
    const [isFocus2, setIsFocus2] = useState(false);
    const [palletData, setPalletData] = useState([]);
    const [isLoadingPallets, setIsLoadingPallets] = useState(false);
    const router = useRouter();

    // Formato de fecha DD/MM/YYYY para SQL Server
    const formatDate = (date) => {
        if (!date) return '';
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };    
    
    // Cargar datos cuando cambian los filtros
    useEffect(() => {
        if (selectedCamara && date) {
            fetchPalletData();
        }
    }, [selectedCamara, date]);
    
    // Función para cargar datos de pallets
    const fetchPalletData = async () => {
        try {
            if (!selectedCamara || !date) {
                return;
            }
            
            setIsLoadingPallets(true);
            const fechaFormateada = formatDate(date);
            
            // Construir URL para obtener informe diario
            const informeUrl = `${API_URL}/validacion/informe-diario?fecha=${encodeURIComponent(fechaFormateada)}`;
            
            console.log('Consultando datos de informe diario con fecha:', fechaFormateada);
            
            const response = await fetch(informeUrl);
            const result = await response.json();
            
            if (result.success && result.data) {
                // Filtrar por cámara seleccionada si es necesario
                const filteredData = selectedCamara 
                    ? result.data.filter(item => item.LINEA?.includes(selectedCamara) || item.Camara === selectedCamara)
                    : result.data;
                
                setPalletData(filteredData);
            } else {
                setPalletData([]);
                console.log('No se encontraron datos de pallets:', result.message);
            }
        } catch (error) {
            console.error('Error al obtener datos de pallets:', error);
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'No se pudieron cargar los datos de pallets.'
            });
            setPalletData([]);
        } finally {
            setIsLoadingPallets(false);
        }
    };

    // Manejador de cambio de fecha
    const onChange = (event, selectedDate) => {
        const currentDate = selectedDate || date;
        setShow(Platform.OS === 'ios');
        setDate(currentDate);
    };

    // Mostrar selector de fecha
    const showDatepicker = () => {
        setShow(true);
    };

    // Cargar cámaras cuando cambia el frigorífico
    useEffect(() => {
        if (selectedFrio) {
            fetch(`${API_URL}/camaras/${selectedFrio}`)
                .then(response => response.json())
                .then(data => setCamaras(data))
                .catch(error => console.error('Error fetching camaras:', error));
        }
    }, [selectedFrio]);

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

                    {/* Título */}
                    <View>
                        <Text style={styles.welcomeText}>Informe de Pallets</Text>
                    </View>

                    {/* Contenedor para el Dropdown y el DateTimePicker */}
                    <View style={styles.controlsContainer}>
                        <View style={styles.dropdownContainer}>
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
                            />
                        </View>
                        <View style={styles.dateContainer}>
                            <Button onPress={showDatepicker} title="Seleccionar fecha" />
                            {show && (
                                <DateTimePicker
                                    testID="dateTimePicker"
                                    value={date}
                                    mode="date"
                                    is24Hour={true}
                                    display="default"
                                    onChange={onChange}
                                />
                            )}
                            <Text style={styles.dateText}>
                                {date.toLocaleDateString()}
                            </Text>
                        </View>
                    </View>

                    {/* Botón para actualizar datos */}
                    <Button
                        title={"Actualizar Datos"}
                        onPress={() => fetchPalletData()}
                        disabled={isLoadingPallets}
                        color={theme.colors.primary}
                    />
                    
                    {/* Tabla de Pallets */}
                    <View style={styles.tableContainer}>
                        <Text style={styles.tableTitle}>Detalle de Pallets</Text>
                        
                        {isLoadingPallets ? (
                            <ActivityIndicator size="large" color={theme.colors.primary} style={styles.loader} />
                        ) : palletData.length === 0 ? (
                            <Text style={styles.noDataText}>No se encontraron registros para los filtros aplicados</Text>
                        ) : (
                            <ScrollView horizontal>
                                <View style={styles.table}>
                                    {/* Cabecera de la tabla */}
                                    <View style={styles.tableRow}>
                                        <View style={[styles.tableHeader, styles.folioCol]}>
                                            <Text style={styles.headerText}>Folio</Text>
                                        </View>
                                        <View style={[styles.tableHeader, styles.especieCol]}>
                                            <Text style={styles.headerText}>Especie</Text>
                                        </View>
                                        {/* <View style={[styles.tableHeader, styles.fechaCol]}>
                                            <Text style={styles.headerText}>Fecha</Text>
                                        </View> */}
                                        <View style={[styles.tableHeader, styles.cajasCol]}>
                                            <Text style={styles.headerText}>Cajas</Text>
                                        </View>
                                        <View style={[styles.tableHeader, styles.camaraCol]}>
                                            <Text style={styles.headerText}>Cámara</Text>
                                        </View>
                                        <View style={[styles.tableHeader, styles.estadoCol]}>
                                            <Text style={styles.headerText}>Estado</Text>
                                        </View>
                                    </View>
                                    
                                    {/* Filas de la tabla */}
                                    <ScrollView>
                                        {palletData.map((item, index) => (
                                            <View 
                                                key={`${item.Folio}-${index}`} 
                                                style={[
                                                    styles.tableRow,
                                                    index % 2 === 0 ? styles.evenRow : styles.oddRow
                                                ]}
                                            >
                                                <View style={[styles.tableCell, styles.folioCol]}>
                                                    <Text style={styles.cellText}>{item.Folio}</Text>
                                                </View>
                                                <View style={[styles.tableCell, styles.especieCol]}>
                                                    <Text style={styles.cellText}>{item.Especie}</Text>
                                                </View>
                                                {/* <View style={[styles.tableCell, styles.fechaCol]}>
                                                    <Text style={styles.cellText}>{item.Fecha_packing}</Text>
                                                </View> */}
                                                <View style={[styles.tableCell, styles.cajasCol]}>
                                                    <Text style={styles.cellText}>{item.Cajas}</Text>
                                                </View>
                                                <View style={[styles.tableCell, styles.camaraCol]}>
                                                    <Text style={styles.cellText}>{item.Camara || 'N/A'}</Text>
                                                </View>
                                                <View style={[
                                                    styles.tableCell, 
                                                    styles.estadoCol,
                                                    (item.Estado && item.Estado.toLowerCase() === 'validado') ? styles.estadoValidado :
                                                    (item.Estado && item.Estado.toLowerCase() === 'rechazado') ? styles.estadoRechazado :
                                                    styles.estadoExistencia
                                                ]}>
                                                    <Text style={[
                                                        styles.estadoText,
                                                        (item.Estado && item.Estado.toLowerCase() === 'rechazado') ? styles.estadoRechazadoText : null
                                                    ]}>{item.Estado}</Text>
                                                </View>
                                            </View>
                                        ))}
                                    </ScrollView>
                                </View>
                            </ScrollView>
                        )}
                    </View>
                </KeyboardAwareScrollView>
            </KeyboardAvoidingView>
            <Toast />
        </ScreenWrapper>
    );
};

export default Report;

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        gap: 15,
        paddingHorizontal: wp(5)
    },
    welcomeText: {
        fontSize: hp(3),
        fontWeight: theme.fonts.bold,
        color: theme.colors.text,
        textAlign: 'center',
        marginBottom: 15,
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
    placeholderStyle: {
        fontSize: 16,
        color: '#888',
    },
    inputSearchStyle: {
        height: 40,
        fontSize: 16,
    },
    selectedTextStyle: {
        fontSize: 16,
        color: '#333',
        marginBottom: 8
        
    },
    iconStyle: {
        width: 20,
        height: 20,
    },
    dateText: {
        marginTop: 5,
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
        color: '#333',
    },
    controlsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        width: '100%',
        marginBottom: 15,
    },
    dropdownContainer: {
        flex: 1,
        paddingRight: 10,
    },
    dateContainer: {
        width: 'auto',
        alignItems: 'center',
        justifyContent: 'center',
    },
    // Estilos para la tabla de pallets
    tableContainer: {
        marginTop: 20,
        marginBottom: 20,
        borderRadius: 10,
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        padding: 10,
        flex: 1,
    },
    tableTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 10,
        textAlign: 'center',
    },
    table: {
        width: '100%',
        borderRadius: 8,
        overflow: 'hidden',
    },
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    tableHeader: {
        padding: 12,
        backgroundColor: theme.colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    tableCell: {
        padding: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 14,
        textAlign: 'center',
    },
    cellText: {
        color: '#333',
        fontSize: 12,
        textAlign: 'center'
    },
    folioCol: { 
        width: 100,
    },
    especieCol: { 
        width: 120,
    },
    fechaCol: { 
        width: 100,
    },
    cajasCol: { 
        width: 60,
    },
    camaraCol: { 
        width: 120,
    },
    estadoCol: { 
        width: 100,
    },
    evenRow: {
        backgroundColor: '#f9f9f9',
    },
    oddRow: {
        backgroundColor: '#fff',
    },
    noDataText: {
        textAlign: 'center',
        padding: 20,
        color: '#666',
    },
    loader: {
        padding: 20,
    },
    estadoValidado: {
        backgroundColor: 'rgba(75, 181, 67, 0.3)', // Verde claro más visible
    },
    estadoRechazado: {
        backgroundColor: '#f44336', // Rojo sólido
    },
    estadoExistencia: {
        backgroundColor: 'rgba(255, 193, 7, 0.2)', // Mantenemos el amarillo actual
    },
    estadoText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#333',
    },
    estadoRechazadoText: {
        color: 'white', // Texto blanco para el estado rechazado
    },
});