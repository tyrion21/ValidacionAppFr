const { withAndroidManifest, withDangerousMod } = require('@expo/config-plugins');
const path = require('path');
const fs = require('fs');

function withNetworkSecurityManifest(config) {
    return withAndroidManifest(config, async config => {
        const application = config.modResults.manifest.application[0];
        // Agregar el atributo android:networkSecurityConfig
        application['$']['android:networkSecurityConfig'] = '@xml/network_security_config';
        return config;
    });
}

function withNetworkSecurityConfigResource(config) {
    return withDangerousMod(config, [
        'android',
        async config => {
            const projectRoot = config.modRequest.projectRoot;
            const src = path.resolve(projectRoot, 'assets/network_security_config.xml');
            const dest = path.join(
                config.modRequest.platformProjectRoot,
                'app/src/main/res/xml/network_security_config.xml'
            );

            // Asegurarse de que el directorio exista
            fs.mkdirSync(path.dirname(dest), { recursive: true });

            // Copiar el archivo
            fs.copyFileSync(src, dest);

            return config;
        },
    ]);
}

module.exports = function withNetworkSecurityConfig(config) {
    config = withNetworkSecurityManifest(config);
    config = withNetworkSecurityConfigResource(config);
    return config;
};