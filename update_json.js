const fs = require('fs');

const update = (file, additions) => {
    let raw = fs.readFileSync(file);
    let data = JSON.parse(raw);
    Object.assign(data.navigation, additions);
    fs.writeFileSync(file, JSON.stringify(data, null, 4));
};

update('public/locales/en/translation.json', {
    "portfolio": "Portfolio",
    "marketplace": "Marketplace",
    "secondary_market": "Secondary Market",
    "farm_dashboard": "Farm Dashboard",
    "my_farms": "My Farms",
    "admin_panel": "Admin Panel",
    "farm_management": "Farm Management",
    "encyclopedia": "Encyclopedia"
});

update('public/locales/id/translation.json', {
    "portfolio": "Portofolio",
    "marketplace": "Bursa",
    "secondary_market": "Pasar Sekunder",
    "farm_dashboard": "Dasbor Kebun",
    "my_farms": "Kebun Saya",
    "admin_panel": "Panel Admin",
    "farm_management": "Manajemen Kebun",
    "encyclopedia": "Ensiklopedia"
});
