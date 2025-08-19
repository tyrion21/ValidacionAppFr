import React, { useEffect, useState } from 'react';
import { View, Text, Alert, TouchableOpacity, StyleSheet } from 'react-native';
import { testServerConnection } from '@/services/validacionService';
import { API_URL } from '@/constants/constantes';

export const ConnectionTest = () => {
  const [connectionStatus, setConnectionStatus] = useState('testing');
  const [lastTest, setLastTest] = useState(null);

  const runConnectionTest = async () => {
    setConnectionStatus('testing');
    try {
      const isConnected = await testServerConnection();
      setConnectionStatus(isConnected ? 'connected' : 'failed');
      setLastTest(new Date().toLocaleTimeString());
      
      if (!isConnected) {
        Alert.alert(
          'Error de Conexión', 
          `No se puede conectar al servidor\n${API_URL}\n\nVerifica:\n1. WiFi conectado\n2. Servidor corriendo\n3. Firewall configurado`,
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert('Conexión Exitosa', 'El servidor está respondiendo correctamente');
      }
    } catch (error) {
      setConnectionStatus('error');
      setLastTest(new Date().toLocaleTimeString());
      Alert.alert('Error', `Error de red: ${error.message}`);
    }
  };

  useEffect(() => {
    // Test automático al cargar el componente
    runConnectionTest();
  }, []);

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return '#4CAF50';
      case 'failed': return '#F44336';
      case 'error': return '#FF9800';
      default: return '#2196F3';
    }
  };

  const getStatusText = () => {
    switch (connectionStatus) {
      case 'connected': return 'Conectado';
      case 'failed': return 'Sin conexión';
      case 'error': return 'Error';
      default: return 'Probando...';
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Test de Conectividad</Text>
      <Text style={styles.url}>Servidor: {API_URL}</Text>
      
      <View style={[styles.statusContainer, { backgroundColor: getStatusColor() }]}>
        <Text style={styles.statusText}>{getStatusText()}</Text>
      </View>
      
      {lastTest && (
        <Text style={styles.lastTest}>Última prueba: {lastTest}</Text>
      )}
      
      <TouchableOpacity style={styles.button} onPress={runConnectionTest}>
        <Text style={styles.buttonText}>Probar Conexión</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  url: {
    fontSize: 12,
    color: '#666',
    marginBottom: 20,
  },
  statusContainer: {
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  statusText: {
    color: 'white',
    fontWeight: 'bold',
  },
  lastTest: {
    fontSize: 12,
    color: '#999',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#2196F3',
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
