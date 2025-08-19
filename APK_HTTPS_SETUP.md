# Configuración para APKs React Native/Expo con HTTPS

## Problema
Las APKs de React Native/Expo no confían por defecto en certificados autofirmados, incluso si funcionan en el navegador móvil y en Expo Go.

## Soluciones Implementadas

### 1. ✅ Network Security Config
Archivo: `assets/network_security_config.xml`
- Permite certificados autofirmados para el dominio específico
- Configurado para la IP del servidor: `192.168.7.25`

### 2. ✅ Configuración en app.json
```json
{
  "android": {
    "networkSecurityConfig": "./assets/network_security_config.xml",
    "usesCleartextTraffic": true
  }
}
```

### 3. ✅ Plugin de Build Properties
Configuración mejorada en expo-build-properties para incluir networkSecurityConfig

### 4. ✅ Servicio Mejorado
- Timeout de 15 segundos para APKs
- Manejo mejorado de errores de red
- Función de test de conectividad

## Pasos para Generar Nueva APK

### 1. Limpiar caché de Expo
```bash
npx expo install --fix
npx expo r -c
```

### 2. Generar nueva build
```bash
eas build --platform android --profile production
```

### 3. Si usas desarrollo local
```bash
npx expo run:android
```

## Debugging en APK

### 1. Agregar función de test al inicio de la app
```javascript
import { testServerConnection } from '@/services/validacionService';

// En tu componente principal
useEffect(() => {
  const checkConnection = async () => {
    const isConnected = await testServerConnection();
    console.log('Server connection:', isConnected);
    if (!isConnected) {
      Alert.alert('Error de Conexión', 'No se puede conectar al servidor');
    }
  };
  checkConnection();
}, []);
```

### 2. Verificar logs con adb
```bash
adb logcat | grep -i "validacion\|network\|ssl\|https"
```

## Configuraciones Alternativas

### Si aún no funciona, agregar a app.json:
```json
{
  "android": {
    "permissions": [
      "android.permission.INTERNET",
      "android.permission.ACCESS_NETWORK_STATE"
    ]
  }
}
```

### Para desarrollo, usar HTTP temporalmente:
```javascript
// En constantes.js - solo para testing APK
export const API_URL = 'http://192.168.7.25:4000'
```

## Verificación

### 1. En el servidor, agregar endpoint de health
Ya está configurado en `/health`

### 2. Test desde APK
La función `testServerConnection()` probará la conectividad

### 3. Verificar certificado
```bash
openssl s_client -connect 192.168.7.25:4000 -showcerts
```

## Notas Importantes

1. **Regenerar APK**: Después de estos cambios, DEBES generar una nueva APK
2. **Network Security Config**: Solo funciona en APKs, no en Expo Go
3. **Certificados**: Los certificados autofirmados requieren configuración especial
4. **Timeout**: APKs pueden ser más lentas, por eso aumentamos el timeout

## Si Persiste el Problema

1. Verificar que el servidor backend tenga el endpoint `/health`
2. Probar con HTTP temporalmente para aislar el problema SSL
3. Verificar logs de Android con adb logcat
4. Considerar usar un certificado válido (Let's Encrypt) en lugar de autofirmado
