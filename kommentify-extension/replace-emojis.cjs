const fs = require('fs');
const path = require('path');

// Emoji to icon class mapping
const emojiMap = {
    '📊': '<span class="icon icon-chart"></span>',
    '📈': '<span class="icon icon-trending-up"></span>',
    '💬': '<span class="icon icon-message"></span>',
    '👍': '<span class="icon icon-thumbs-up"></span>',
    '❤': '<span class="icon icon-heart"></span>',
    '📤': '<span class="icon icon-share"></span>',
    '👥': '<span class="icon icon-users"></span>',
    '🤝': '<span class="icon icon-user-plus"></span>',
    '👤': '<span class="icon icon-user"></span>',
    '🔗': '<span class="icon icon-link"></span>',
    '✍': '<span class="icon icon-edit"></span>',
    '📝': '<span class="icon icon-edit"></span>',
    '⚡': '<span class="icon icon-zap"></span>',
    '🤖': '<span class="icon icon-bot"></span>',
    '✨': '<span class="icon icon-sparkles"></span>',
    '🚀': '<span class="icon icon-rocket"></span>',
    '⏰': '<span class="icon icon-clock"></span>',
    '🕐': '<span class="icon icon-clock"></span>',
    '🕒': '<span class="icon icon-clock"></span>',
    '📅': '<span class="icon icon-calendar"></span>',
    '⏱': '<span class="icon icon-timer"></span>',
    '⏳': '<span class="icon icon-hourglass"></span>',
    '✅': '<span class="icon icon-check"></span>',
    '❌': '<span class="icon icon-x"></span>',
    '⚠': '<span class="icon icon-alert"></span>',
    '🛑': '<span class="icon icon-stop"></span>',
    '📥': '<span class="icon icon-download"></span>',
    '📁': '<span class="icon icon-folder"></span>',
    '🗑': '<span class="icon icon-trash"></span>',
    '💾': '<span class="icon icon-save"></span>',
    '⚙': '<span class="icon icon-settings"></span>',
    '🎯': '<span class="icon icon-target"></span>',
    '💡': '<span class="icon icon-lightbulb"></span>',
    '🔍': '<span class="icon icon-search"></span>',
    '➕': '<span class="icon icon-plus"></span>',
    '🔄': '<span class="icon icon-refresh"></span>',
    '📧': '<span class="icon icon-mail"></span>',
    '📩': '<span class="icon icon-mail"></span>',
    '✉': '<span class="icon icon-mail"></span>',
    '📱': '<span class="icon icon-phone"></span>',
    '🔑': '<span class="icon icon-key"></span>',
    '🚪': '<span class="icon icon-log-out"></span>',
    '📚': '<span class="icon icon-book"></span>',
    '📖': '<span class="icon icon-book"></span>',
    '🎓': '<span class="icon icon-award"></span>',
    '🏆': '<span class="icon icon-award"></span>',
    '🎁': '<span class="icon icon-gift"></span>',
    '💎': '<span class="icon icon-diamond"></span>',
    '🎲': '<span class="icon icon-shuffle"></span>',
    '📋': '<span class="icon icon-clipboard"></span>',
    '📄': '<span class="icon icon-file-text"></span>',
    '📃': '<span class="icon icon-file-text"></span>',
    '🌐': '<span class="icon icon-globe"></span>',
    '📍': '<span class="icon icon-map-pin"></span>',
    '💳': '<span class="icon icon-credit-card"></span>',
    '🎭': '<span class="icon icon-mask"></span>',
    '📏': '<span class="icon icon-ruler"></span>',
    '💼': '<span class="icon icon-briefcase"></span>',
    '📜': '<span class="icon icon-scroll"></span>',
    '⏸': '<span class="icon icon-pause"></span>',
    '🎛': '<span class="icon icon-sliders"></span>',
    '🌱': '<span class="icon icon-sprout"></span>',
    '🌿': '<span class="icon icon-leaf"></span>',
    '😊': '<span class="icon icon-smile"></span>',
    '🧲': '<span class="icon icon-magnet"></span>',
    '💭': '<span class="icon icon-thought"></span>',
};

const htmlDir = path.join(__dirname, 'src/components/html');

// Get all HTML files
const htmlFiles = fs.readdirSync(htmlDir).filter(f => f.endsWith('.html'));

console.log(`Found ${htmlFiles.length} HTML files to process\n`);

let totalReplacements = 0;

htmlFiles.forEach(file => {
    const filePath = path.join(htmlDir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    let fileReplacements = 0;
    
    // Replace each emoji
    Object.entries(emojiMap).forEach(([emoji, icon]) => {
        const regex = new RegExp(emoji, 'g');
        const matches = content.match(regex);
        if (matches) {
            fileReplacements += matches.length;
            content = content.replace(regex, icon);
        }
    });
    
    if (fileReplacements > 0) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`✓ ${file}: ${fileReplacements} replacements`);
        totalReplacements += fileReplacements;
    } else {
        console.log(`- ${file}: no emojis found`);
    }
});

console.log(`\n✅ Total: ${totalReplacements} emoji replacements across ${htmlFiles.length} files`);
