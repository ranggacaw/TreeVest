const fs = require('fs');
const path = require('path');

const adminDir = path.join(__dirname, 'resources', 'js', 'Pages', 'Admin');

function findReactComponentEnd(content) {
    let unclosedFragments = 0;
    for (let i = content.length - 1; i >= 0; i--) {
        if (content.substr(i, 3) === '</>') {
            return i;
        }
    }
    return -1;
}

function processDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            processDir(fullPath);
        } else if (fullPath.endsWith('.tsx')) {
            processFile(fullPath);
        }
    }
}

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;

    // Skip parsing if it already uses AppLayout
    if (content.includes('import { AppLayout }') || content.includes('import { AppLayout }') || content.includes('import {AppLayout}')) {
        return;
    }

    let changed = false;

    // Find the title for AppLayout
    let title = "Admin Content";
    const titleMatch = content.match(/<Head title="([^"]+)"/);
    if (titleMatch) {
        title = titleMatch[1];
    } else {
        const headerMatch = content.match(/<h2[^>]*>(.*?)<\/h2>/);
        if (headerMatch) {
            title = headerMatch[1];
        } else {
            const h1Match = content.match(/<h1[^>]*>(.*?)<\/h1>/);
            if (h1Match) title = h1Match[1];
        }
    }

    if (content.includes('import AuthenticatedLayout')) {
        // Change from AuthenticatedLayout
        content = content.replace(/import AuthenticatedLayout[^\n]+;\n?/, "import { AppLayout } from '@/Layouts';\n");
        content = content.replace(/<AuthenticatedLayout[^>]*>/, `<AppLayout title="${title}">`);
        content = content.replace(/<\/AuthenticatedLayout>/, "</AppLayout>");
        changed = true;
    } else {
        // Assume it uses <> ... </> at the root
        const rootIndex = content.indexOf('<>');
        if (rootIndex !== -1) {
            // Check if AppLayout import exists
            if (!content.includes('import { AppLayout }')) {
                // Find import block
                const lastImport = content.lastIndexOf('import ');
                const eol = content.indexOf('\\n', lastImport);
                content = "import { AppLayout } from '@/Layouts';\n" + content;
            }

            content = content.replace('<>', `<AppLayout title="${title}">`);
            const endIdx = findReactComponentEnd(content);
            if (endIdx !== -1) {
                content = content.substring(0, endIdx) + '</AppLayout>' + content.substring(endIdx + 3);
            }
            changed = true;
        }
    }

    if (changed) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated ${filePath}`);
    }
}

processDir(adminDir);
