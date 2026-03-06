const fs = require('fs');

const badges = [
    'resources/js/Components/FarmStatusBadge.tsx',
    'resources/js/Components/HarvestStatusBadge.tsx',
    'resources/js/Components/KycStatusBadge.tsx',
    'resources/js/Components/HealthSeverityBadge.tsx',
    'resources/js/Components/RiskBadge.tsx'
];

badges.forEach(file => {
    if (!fs.existsSync(file)) return;
    let content = fs.readFileSync(file, 'utf8');
    
    // Add useTranslation
    if (!content.includes('useTranslation')) {
        content = content.replace("import React from 'react';", "import React from 'react';\nimport { useTranslation } from 'react-i18next';");
        content = content.replace(/export default function \w+\([^)]+\) \{/, match => match + "\n    const { t } = useTranslation();");
    }

    // Rewrite labels object inside the component to use t('badge.X', 'Fallback')
    // We'll use a simple regex replacing string values in the labels object.
    // Example: active: 'Active', -> active: t('badge.active', 'Active'),
    content = content.replace(/(labels\s*(?::[^=]+)?\s*=\s*\{)([^}]+)(\})/g, (match, prefix, body, suffix) => {
        const newBody = body.replace(/(\w+):\s*'([^']+)'/g, (m, key, val) => {
            return `${key}: t('badge.${key}', '${val}')`;
        });
        return prefix + newBody + suffix;
    });

    fs.writeFileSync(file, content, 'utf8');
});
