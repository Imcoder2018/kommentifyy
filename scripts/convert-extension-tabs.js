/**
 * Extension to TSX Converter Script v2
 * Converts Chrome extension HTML/JS components to React TSX for live preview
 * 
 * Usage: node scripts/convert-extension-tabs-v2.js
 */

const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
    extensionHtmlPath: 'G:\\0101 Arman Projects\\minify-extension\\src\\components\\html',
    extensionJsPath: 'G:\\0101 Arman Projects\\minify-extension\\src\\components\\js',
    outputPath: 'G:\\0101 Arman Projects\\backend-api\\app\\components\\tabs',
    
    // Map HTML files to TSX component names
    fileMapping: {
        'dashboard.html': 'DashboardTab.tsx',
        'automation.html': 'AutomationTab.tsx',
        'post_writer.html': 'WriterTab.tsx',
        'networking.html': 'NetworkTab.tsx',
        'analytics.html': 'AnalyticsTab.tsx',
        'settings.html': 'SettingsTab.tsx',
        'import.html': 'ImportTab.tsx',
        'limits.html': 'LimitsTab.tsx',
    },
    
    // Icon class to component mapping
    iconMapping: {
        'icon-chart': 'IconChart',
        'icon-message': 'IconMessage',
        'icon-thumbs-up': 'IconThumbsUp',
        'icon-share': 'IconShare',
        'icon-plus': 'IconPlus',
        'icon-user-plus': 'IconUserPlus',
        'icon-zap': 'IconZap',
        'icon-edit': 'IconEdit',
        'icon-users': 'IconUsers',
        'icon-download': 'IconDownload',
        'icon-refresh': 'IconRefresh',
        'icon-bot': 'IconBot',
        'icon-sparkles': 'IconSparkles',
        'icon-lightbulb': 'IconLightbulb',
        'icon-stop': 'IconStop',
        'icon-play': 'IconPlay',
        'icon-pause': 'IconPause',
        'icon-settings': 'IconSettings',
        'icon-search': 'IconSearch',
        'icon-filter': 'IconFilter',
        'icon-clock': 'IconClock',
        'icon-calendar': 'IconCalendar',
        'icon-trash': 'IconTrash',
        'icon-check': 'IconCheck',
        'icon-x': 'IconX',
        'icon-alert': 'IconAlert',
        'icon-info': 'IconInfo',
        'icon-help': 'IconHelp',
        'icon-copy': 'IconCopy',
        'icon-save': 'IconSave',
        'icon-send': 'IconSend',
        'icon-link': 'IconLink',
        'icon-rocket': 'IconRocket',
        'icon-target': 'IconTarget',
        'icon-trending': 'IconTrending',
        'icon-mail': 'IconMail',
        'icon-heart': 'IconHeart',
        'icon-file-text': 'IconFileText',
        'icon-folder': 'IconFolder',
        'icon-user': 'IconUser',
        'icon-log-out': 'IconLogOut',
        'icon-globe': 'IconGlobe',
        'icon-briefcase': 'IconBriefcase',
        'icon-map-pin': 'IconMapPin',
        'icon-hourglass': 'IconHourglass',
        'icon-sliders': 'IconSliders',
        'icon-timer': 'IconTimer',
        'icon-gift': 'IconGift',
        'icon-key': 'IconKey',
        'icon-award': 'IconAward',
        'icon-list': 'IconList',
    }
};

/**
 * Convert inline style string to React style object string
 */
function convertStyleToJsxObject(styleString) {
    if (!styleString) return '{}';
    
    const result = {};
    const declarations = styleString.split(';').filter(d => d.trim());
    
    for (const declaration of declarations) {
        const colonIndex = declaration.indexOf(':');
        if (colonIndex === -1) continue;
        
        let property = declaration.substring(0, colonIndex).trim();
        let value = declaration.substring(colonIndex + 1).trim();
        
        // Convert kebab-case to camelCase
        property = property.replace(/-([a-z])/g, (match, letter) => letter.toUpperCase());
        
        // Handle numeric values
        if (/^\d+$/.test(value)) {
            result[property] = parseInt(value, 10);
        } else {
            result[property] = value;
        }
    }
    
    return JSON.stringify(result);
}

/**
 * Convert HTML to JSX
 */
function htmlToJsx(html) {
    let jsx = html;
    
    // Remove HTML comments or convert to JSX comments
    jsx = jsx.replace(/<!--\s*(.*?)\s*-->/g, '{/* $1 */}');
    
    // Convert class to className
    jsx = jsx.replace(/\sclass="/g, ' className="');
    jsx = jsx.replace(/\sclass='/g, " className='");
    
    // Convert for to htmlFor
    jsx = jsx.replace(/\sfor="/g, ' htmlFor="');
    
    // Self-close void elements
    jsx = jsx.replace(/<input([^>]*[^/])>/gi, '<input$1 />');
    jsx = jsx.replace(/<br\s*>/gi, '<br />');
    jsx = jsx.replace(/<hr\s*>/gi, '<hr />');
    jsx = jsx.replace(/<img([^>]*[^/])>/gi, '<img$1 />');
    
    // Convert inline styles to objects
    jsx = jsx.replace(/style="([^"]*)"/g, (match, styleString) => {
        return `style={${convertStyleToJsxObject(styleString)}}`;
    });
    
    jsx = jsx.replace(/style='([^']*)'/g, (match, styleString) => {
        return `style={${convertStyleToJsxObject(styleString)}}`;
    });
    
    // Convert icon spans to components
    jsx = jsx.replace(/<span\s+className="icon\s+icon-([^"]+)"[^>]*><\/span>/g, (match, iconName) => {
        const iconClass = `icon-${iconName}`;
        const iconComponent = CONFIG.iconMapping[iconClass] || 'IconZap';
        return `<${iconComponent} size={14} />`;
    });
    
    // Handle standalone boolean attributes
    jsx = jsx.replace(/\sdisabled(?=[\s>])/gi, ' disabled={true}');
    jsx = jsx.replace(/\sreadonly(?=[\s>])/gi, ' readOnly={true}');
    jsx = jsx.replace(/\sautofocus(?=[\s>])/gi, ' autoFocus={true}');
    jsx = jsx.replace(/\schecked(?=[\s>])/gi, ' defaultChecked={true}');
    
    // Remove selected attribute (React handles this differently)
    jsx = jsx.replace(/\sselected(?=[\s>])/gi, '');
    
    // Remove event handlers (static preview)
    jsx = jsx.replace(/\son[a-z]+="[^"]*"/gi, '');
    
    // Convert other HTML attributes to JSX equivalents (numeric values)
    jsx = jsx.replace(/\stabindex="(\d+)"/gi, ' tabIndex={$1}');
    jsx = jsx.replace(/\scolspan="(\d+)"/gi, ' colSpan={$1}');
    jsx = jsx.replace(/\srowspan="(\d+)"/gi, ' rowSpan={$1}');
    jsx = jsx.replace(/\smaxlength="(\d+)"/gi, ' maxLength={$1}');
    jsx = jsx.replace(/\sminlength="(\d+)"/gi, ' minLength={$1}');
    jsx = jsx.replace(/\srows="(\d+)"/gi, ' rows={$1}');
    jsx = jsx.replace(/\scols="(\d+)"/gi, ' cols={$1}');
    jsx = jsx.replace(/\ssize="(\d+)"/gi, ' size={$1}');
    jsx = jsx.replace(/\scontenteditable=/gi, ' contentEditable=');
    jsx = jsx.replace(/\scellpadding="(\d+)"/gi, ' cellPadding={$1}');
    jsx = jsx.replace(/\scellspacing="(\d+)"/gi, ' cellSpacing={$1}');
    
    return jsx;
}

/**
 * Get unique icons used in JSX
 */
function getUsedIcons(jsx) {
    const usedIcons = new Set(['IconZap']); // Always include default
    for (const [iconClass, component] of Object.entries(CONFIG.iconMapping)) {
        if (jsx.includes(`<${component}`)) {
            usedIcons.add(component);
        }
    }
    return Array.from(usedIcons).sort();
}

/**
 * Format JSX content - keep it simple, just clean up whitespace
 */
function formatJsx(jsx) {
    // Join everything into a single line first, then split properly
    let content = jsx
        .replace(/\r\n/g, '\n')
        .replace(/\n+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
    
    // Now add proper line breaks after closing tags
    content = content.replace(/>\s*</g, '>\n<');
    content = content.replace(/>\s*\{\/\*/g, '>\n{/*');
    content = content.replace(/\*\/\}\s*</g, '*/}\n<');
    
    // Split and indent
    const lines = content.split('\n');
    let result = [];
    let indent = 3; // Base indent inside return
    const indentStr = '    ';
    
    for (let line of lines) {
        line = line.trim();
        if (!line) continue;
        
        // Decrease indent for closing tags
        if (line.startsWith('</')) {
            indent = Math.max(0, indent - 1);
        }
        
        result.push(indentStr.repeat(indent) + line);
        
        // Increase indent for opening tags (not self-closing and not inline closed)
        if (line.match(/^<[a-zA-Z][^>]*>$/) && !line.endsWith('/>') && !line.includes('</')) {
            indent++;
        }
    }
    
    return result.join('\n');
}

/**
 * Create TSX component from HTML
 */
function createTsxComponent(componentName, jsxContent) {
    const usedIcons = getUsedIcons(jsxContent);
    
    // Format the JSX content
    const formattedJsx = formatJsx(jsxContent);
    
    const template = `'use client';
import React from 'react';
import { ${usedIcons.join(', ')} } from './Icons';

export default function ${componentName.replace('.tsx', '')}() {
    return (
        <>
${formattedJsx}
        </>
    );
}
`;
    
    return template;
}

/**
 * Clean HTML before conversion
 */
function cleanHtml(html) {
    // Remove <style> tags completely - CSS curly braces break JSX
    html = html.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
    
    // Remove <script> tags
    html = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
    
    // Remove the outer wrapper div if present
    html = html.replace(/<div\s+id="[^"]*-content"\s+class="tab-content[^"]*">\s*/gi, '');
    html = html.replace(/\s*<\/div>\s*$/gi, ''); // Remove trailing </div>
    
    // Remove empty style attributes
    html = html.replace(/\sstyle=""\s*/g, ' ');
    html = html.replace(/\sstyle=''\s*/g, ' ');
    
    // Remove empty class attributes
    html = html.replace(/\sclass=""\s*/g, ' ');
    
    // Show hidden elements for preview
    html = html.replace(/display:\s*none/g, 'display: block');
    
    // Remove emojis and other problematic unicode characters
    // eslint-disable-next-line no-control-regex
    html = html.replace(/[\u{1F600}-\u{1F64F}]/gu, ''); // Emoticons
    html = html.replace(/[\u{1F300}-\u{1F5FF}]/gu, ''); // Misc Symbols and Pictographs
    html = html.replace(/[\u{1F680}-\u{1F6FF}]/gu, ''); // Transport and Map
    html = html.replace(/[\u{1F1E0}-\u{1F1FF}]/gu, ''); // Flags
    html = html.replace(/[\u{2600}-\u{26FF}]/gu, '');   // Misc symbols
    html = html.replace(/[\u{2700}-\u{27BF}]/gu, '');   // Dingbats
    html = html.replace(/[\u{FE00}-\u{FE0F}]/gu, '');   // Variation Selectors
    html = html.replace(/[\u{1F900}-\u{1F9FF}]/gu, ''); // Supplemental Symbols
    html = html.replace(/[\u{1FA00}-\u{1FA6F}]/gu, ''); // Chess Symbols
    html = html.replace(/[\u{1FA70}-\u{1FAFF}]/gu, ''); // Symbols and Pictographs Extended-A
    html = html.replace(/[\u{231A}-\u{231B}]/gu, '');   // Watch, Hourglass
    html = html.replace(/[\u{23E9}-\u{23F3}]/gu, '');   // Media controls
    html = html.replace(/[\u{23F8}-\u{23FA}]/gu, '');   // Media controls 2
    html = html.replace(/[\u{25AA}-\u{25AB}]/gu, '');   // Squares
    html = html.replace(/[\u{25B6}]/gu, '');            // Play button
    html = html.replace(/[\u{25C0}]/gu, '');            // Reverse button
    html = html.replace(/[\u{25FB}-\u{25FE}]/gu, '');   // Squares 2
    html = html.replace(/[\u{2934}-\u{2935}]/gu, '');   // Arrows
    html = html.replace(/[\u{3030}]/gu, '');            // Wavy dash
    html = html.replace(/[\u{303D}]/gu, '');            // Part alternation mark
    html = html.replace(/[\u{3297}]/gu, '');            // Circled Ideograph Congratulation
    html = html.replace(/[\u{3299}]/gu, '');            // Circled Ideograph Secret
    html = html.replace(/[\u{200D}]/gu, '');            // Zero Width Joiner
    html = html.replace(/[\u{20E3}]/gu, '');            // Combining Enclosing Keycap
    html = html.replace(/[\u{FE0E}-\u{FE0F}]/gu, '');   // Variation Selector
    
    return html;
}

/**
 * Process a single HTML file
 */
function processHtmlFile(htmlFile, outputFile) {
    console.log(`\n📄 Processing: ${htmlFile} -> ${outputFile}`);
    
    const htmlPath = path.join(CONFIG.extensionHtmlPath, htmlFile);
    
    if (!fs.existsSync(htmlPath)) {
        console.log(`   ⚠️ File not found: ${htmlPath}`);
        return false;
    }
    
    try {
        // Read HTML file
        let html = fs.readFileSync(htmlPath, 'utf8');
        console.log(`   📖 Read ${html.length} characters`);
        
        // Clean HTML
        html = cleanHtml(html);
        
        // Convert to JSX
        let jsx = htmlToJsx(html);
        console.log(`   🔄 Converted to JSX`);
        
        // Create component
        const componentName = outputFile.replace('.tsx', '');
        const tsxContent = createTsxComponent(componentName, jsx);
        console.log(`   📦 Created component: ${componentName}`);
        
        // Write to output
        const outputPath = path.join(CONFIG.outputPath, outputFile);
        fs.writeFileSync(outputPath, tsxContent, 'utf8');
        console.log(`   ✅ Saved to: ${outputPath}`);
        
        return true;
    } catch (error) {
        console.error(`   ❌ Error processing ${htmlFile}:`, error.message);
        return false;
    }
}

/**
 * Main conversion function
 */
function main() {
    console.log('🚀 Extension to TSX Converter v2');
    console.log('================================\n');
    console.log(`📁 Source HTML: ${CONFIG.extensionHtmlPath}`);
    console.log(`📁 Output: ${CONFIG.outputPath}`);
    
    // Ensure output directory exists
    if (!fs.existsSync(CONFIG.outputPath)) {
        fs.mkdirSync(CONFIG.outputPath, { recursive: true });
        console.log(`\n📁 Created output directory`);
    }
    
    let successCount = 0;
    let failCount = 0;
    
    // Process each mapped file
    for (const [htmlFile, tsxFile] of Object.entries(CONFIG.fileMapping)) {
        const success = processHtmlFile(htmlFile, tsxFile);
        if (success) {
            successCount++;
        } else {
            failCount++;
        }
    }
    
    console.log('\n================================');
    console.log(`✅ Successfully converted: ${successCount} files`);
    if (failCount > 0) {
        console.log(`❌ Failed: ${failCount} files`);
    }
    console.log('================================\n');
    
    return successCount > 0;
}

// Run the converter
main();
