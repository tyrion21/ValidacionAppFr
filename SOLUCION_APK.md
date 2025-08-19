# 🚀 Solución para APK React Native con HTTPS

## ❌ Problema
Tu APK no se conecta al servidor HTTPS aunque funciona en navegador móvil y red.

## ✅ Solución Implementada

### 1. **Archivos Modificados:**
- ✅ `app.json` - Configuración de networkSecurityConfig
- ✅ `assets/network_security_config.xml` - Permite certificados autofirmados  
- ✅ `services/validacionService.js` - Timeout y manejo de errores mejorado
- ✅ Backend `main.ts` - CORS mejorado para APKs

### 2. **Nuevo Componente de Prueba:**
- ✅ `components/ConnectionTest.jsx` - Para probar conectividad

## 🔧 Pasos a Seguir

### 1. **Generar Nueva APK** (OBLIGATORIO)
```bash
# Limpiar caché
npx expo install --fix
npx expo r -c

# Generar nueva build
eas build --platform android --profile production
```

### 2. **Probar Conectividad en la Nueva APK**
Agrega este componente temporalmente a tu app principal:

```jsx
import { ConnectionTest } from '@/components/ConnectionTest';

// En tu componente principal
<ConnectionTest />
```

### 3. **Verificar Servidor Backend**
Asegúrate de que el servidor esté corriendo con las nuevas configuraciones:
```bash
npm run start:dev
```

### 4. **Si Aún No Funciona - Debugging**

#### A. Verificar con HTTP temporalmente:
```javascript
// En constantes.js - SOLO PARA TESTING
export const API_URL = 'http://192.168.7.25:4000'
```

#### B. Verificar logs de Android:
```bash
adb logcat | grep -i "validacion\|network\|ssl"
```

#### C. Probar endpoint directo:
Desde el navegador móvil: `https://192.168.7.25:4000/health`

## 📋 Configuración Actual

### Network Security Config
```xml
<domain-config cleartextTrafficPermitted="false">
    <domain includeSubdomains="true">192.168.7.25</domain>
    <trust-anchors>
        <certificates src="system"/>
        <certificates src="user"/>
    </trust-anchors>
</domain-config>
```

### CORS Backend
```javascript
origin: ['*', 'https://192.168.7.25:4000', /* otros orígenes */]
```

### Timeout Mejorado
```javascript
const fetchWithTimeout = createFetchWithTimeout(15000); // 15 segundos
```

## 🔍 Troubleshooting

### ✅ Funciona en navegador móvil pero no en APK
**Causa**: APKs no confían en certificados autofirmados por defecto
**Solución**: Network Security Config implementado ✅

### ✅ Error de timeout
**Causa**: APKs pueden ser más lentas que navegadores
**Solución**: Timeout aumentado a 15 segundos ✅

### ✅ Error de CORS
**Causa**: APKs usan User-Agent diferente
**Solución**: CORS expandido con más headers ✅

## 📱 Resultado Esperado

Después de generar la nueva APK con estos cambios:
1. La APK debería conectarse a `https://192.168.7.25:4000`
2. El componente `ConnectionTest` debería mostrar "Conectado"
3. Las funciones de la app deberían funcionar normalmente

## ⚠️ Importante

**DEBES generar una nueva APK** para que estos cambios tengan efecto. Los cambios en `network_security_config.xml` y `app.json` solo se aplican durante el build, no en tiempo de ejecución.

## 🔄 Si Persiste el Problema

1. Prueba con HTTP temporalmente para aislar el problema SSL
2. Verifica que el certificado sea válido: `openssl s_client -connect 192.168.7.25:4000`
3. Considera usar un certificado válido (Let's Encrypt) en lugar de autofirmado

¿Necesitas ayuda con alguno de estos pasos?
