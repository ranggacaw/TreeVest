const fs = require('fs');

const path = 'resources/js/Layouts/AuthenticatedLayout.tsx';
let content = fs.readFileSync(path, 'utf8');

// Add import
if (!content.includes("useTranslation")) {
    content = content.replace(
        "import { PropsWithChildren, ReactNode, useState } from 'react';",
        "import { PropsWithChildren, ReactNode, useState } from 'react';\nimport { useTranslation } from 'react-i18next';"
    );
}

// Add hook
if (!content.includes("const { t } = useTranslation();")) {
    content = content.replace(
        "const page = usePage();",
        "const { t } = useTranslation();\n    const page = usePage();"
    );
}

// Replace strings
const replacements = {
    '>Portfolio<': '>{t(\'navigation.portfolio\')}<',
    '>Marketplace<': '>{t(\'navigation.marketplace\')}<',
    '>Secondary Market<': '>{t(\'navigation.secondary_market\')}<',
    '>Farm Dashboard<': '>{t(\'navigation.farm_dashboard\')}<',
    '>My Farms<': '>{t(\'navigation.my_farms\')}<',
    '>Admin Panel<': '>{t(\'navigation.admin_panel\')}<',
    '>Farm Management<': '>{t(\'navigation.farm_management\')}<',
    '>Education<': '>{t(\'navigation.education\')}<',
    '>Encyclopedia<': '>{t(\'navigation.encyclopedia\')}<',
    '>Profile<': '>{t(\'navigation.profile\')}<',
    '>Log Out<': '>{t(\'auth.logout\')}<'
};

for (const [key, value] of Object.entries(replacements)) {
    // global replace
    content = content.split(key).join(value);
}

fs.writeFileSync(path, content, 'utf8');
