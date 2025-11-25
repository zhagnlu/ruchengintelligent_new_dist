#!/usr/bin/env node

const https = require('https');
const fs = require('fs');
const path = require('path');

// Configuration
const LANGUAGES = [
  { code: 'zh', name: 'Chinese' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ar', name: 'Arabic' },
  { code: 'ru', name: 'Russian' }
];

const DELAY_MS = 700; // Delay between API calls to avoid rate limiting
const BASE_DIR = '/Users/luzhang/github/ruchengintelligent_new';

// Google Translate API function
async function translateText(text, targetLang) {
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;

  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          const translated = parsed[0].map(item => item[0]).join('');
          resolve(translated);
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

// Delay function
async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Extract translatable texts from HTML file
function extractTranslatableTexts(htmlContent) {
  const texts = new Set();

  // Pattern 1: <tag data-translate>Text</tag>
  const pattern1 = /<[^>]+data-translate[^>]*>([^<]+)<\/[^>]+>/g;
  let match;
  while ((match = pattern1.exec(htmlContent)) !== null) {
    const text = match[1].trim();
    if (text && text.length > 0 && !text.match(/^\s*$/)) {
      texts.add(text.replace(/\s+/g, ' ').trim());
    }
  }

  // Pattern 2: <tag><span data-translate>Text</span></tag>
  const pattern2 = /<span[^>]+data-translate[^>]*>([^<]+)<\/span>/g;
  while ((match = pattern2.exec(htmlContent)) !== null) {
    const text = match[1].trim();
    if (text && text.length > 0 && !text.match(/^\s*$/)) {
      texts.add(text.replace(/\s+/g, ' ').trim());
    }
  }

  // Pattern 3: Multi-line content with data-translate
  const pattern3 = /<[^>]+data-translate[^>]*>\s*([^<]+(?:\s*<[^>]+>[^<]*<\/[^>]+>\s*)*[^<]*)<\/[^>]+>/g;
  while ((match = pattern3.exec(htmlContent)) !== null) {
    const text = match[1]
      .replace(/<[^>]+>/g, '') // Remove inner HTML tags
      .replace(/\s+/g, ' ')
      .trim();
    if (text && text.length > 3) {
      texts.add(text);
    }
  }

  return Array.from(texts).sort();
}

// Get page path from file path
function getPagePath(filePath) {
  // Remove base directory and .html extension
  let pagePath = filePath.replace(BASE_DIR + '/', '');

  // Remove .html extension
  if (pagePath.endsWith('.html')) {
    pagePath = pagePath.slice(0, -5);
  }

  // If it's index.html in a directory, just use the directory name
  if (pagePath.endsWith('/index')) {
    pagePath = pagePath.slice(0, -6);
  }

  // For root index.html, use 'index'
  if (pagePath === 'index' || pagePath === '') {
    return 'index';
  }

  return pagePath;
}

// Get locale file path
function getLocaleFilePath(pagePath, langCode) {
  return path.join(BASE_DIR, 'locales', `${pagePath}.${langCode}.json`);
}

// Load existing translations
function loadExistingTranslations(pagePath, langCode) {
  const filePath = getLocaleFilePath(pagePath, langCode);

  if (fs.existsSync(filePath)) {
    try {
      return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch (e) {
      console.error(`Error reading ${filePath}: ${e.message}`);
      return {};
    }
  }

  return {};
}

// Load common and FAQ translations
function loadCommonTranslations(langCode) {
  const translations = {};

  // Load common translations
  const commonPath = path.join(BASE_DIR, 'locales', `common.${langCode}.json`);
  if (fs.existsSync(commonPath)) {
    try {
      Object.assign(translations, JSON.parse(fs.readFileSync(commonPath, 'utf8')));
    } catch (e) {
      console.error(`Error reading common translations: ${e.message}`);
    }
  }

  // Load FAQ translations
  const faqPath = path.join(BASE_DIR, 'locales', `faq-common.${langCode}.json`);
  if (fs.existsSync(faqPath)) {
    try {
      Object.assign(translations, JSON.parse(fs.readFileSync(faqPath, 'utf8')));
    } catch (e) {
      console.error(`Error reading FAQ translations: ${e.message}`);
    }
  }

  return translations;
}

// Save translations to file
function saveTranslations(pagePath, langCode, translations) {
  const filePath = getLocaleFilePath(pagePath, langCode);
  const dir = path.dirname(filePath);

  // Create directory if it doesn't exist
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  // Write file
  fs.writeFileSync(filePath, JSON.stringify(translations, null, 2), 'utf8');
}

// Main function
async function main() {
  // Get HTML file path from command line argument
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log('Usage: node auto-generate-translations.js <html-file-path>');
    console.log('');
    console.log('Example:');
    console.log('  node auto-generate-translations.js product/bending_machine/new-product.html');
    console.log('  node auto-generate-translations.js /full/path/to/product.html');
    process.exit(1);
  }

  let htmlFilePath = args[0];

  // If relative path, make it absolute
  if (!path.isAbsolute(htmlFilePath)) {
    htmlFilePath = path.join(BASE_DIR, htmlFilePath);
  }

  // Check if file exists
  if (!fs.existsSync(htmlFilePath)) {
    console.error(`Error: File not found: ${htmlFilePath}`);
    process.exit(1);
  }

  console.log(`\n📄 Processing file: ${htmlFilePath}`);

  // Read HTML content
  const htmlContent = fs.readFileSync(htmlFilePath, 'utf8');

  // Extract translatable texts
  console.log('\n🔍 Extracting translatable texts...');
  const texts = extractTranslatableTexts(htmlContent);
  console.log(`   Found ${texts.length} unique translatable texts`);

  if (texts.length === 0) {
    console.log('\n⚠️  No translatable texts found. Make sure elements have data-translate attribute.');
    process.exit(0);
  }

  // Get page path
  const pagePath = getPagePath(htmlFilePath);
  console.log(`\n📍 Page path: ${pagePath}`);

  // Process each language
  for (const lang of LANGUAGES) {
    console.log(`\n=== ${lang.name} (${lang.code}) ===`);

    // Load existing translations
    const existingTranslations = loadExistingTranslations(pagePath, lang.code);
    const commonTranslations = loadCommonTranslations(lang.code);

    // Find missing translations
    const missingTexts = texts.filter(text =>
      !existingTranslations[text] && !commonTranslations[text]
    );

    console.log(`   Existing: ${Object.keys(existingTranslations).length}`);
    console.log(`   From common/FAQ: ${texts.filter(t => commonTranslations[t]).length}`);
    console.log(`   Missing: ${missingTexts.length}`);

    if (missingTexts.length === 0) {
      console.log(`   ✅ No missing translations for ${lang.name}`);
      continue;
    }

    // Translate missing texts
    let translated = 0;
    const updatedTranslations = { ...existingTranslations };

    for (let i = 0; i < missingTexts.length; i++) {
      const text = missingTexts[i];

      try {
        const translation = await translateText(text, lang.code);
        updatedTranslations[text] = translation;
        translated++;

        const displayText = text.length > 60 ? text.substring(0, 60) + '...' : text;
        console.log(`   ✓ [${i + 1}/${missingTexts.length}] ${displayText}`);

        // Delay to avoid rate limiting
        if (i < missingTexts.length - 1) {
          await delay(DELAY_MS);
        }
      } catch (error) {
        console.error(`   ✗ [${i + 1}/${missingTexts.length}] Error: ${error.message}`);
        // Use original text as fallback
        updatedTranslations[text] = text;
      }
    }

    // Save translations
    saveTranslations(pagePath, lang.code, updatedTranslations);

    console.log(`\n   ${lang.name} Summary:`);
    console.log(`     - New translations: ${translated}`);
    console.log(`     - Total entries: ${Object.keys(updatedTranslations).length}`);
    console.log(`     - File: locales/${pagePath}.${lang.code}.json`);
  }

  console.log('\n✅ Translation generation completed!');
  console.log('\n📁 Generated files:');
  for (const lang of LANGUAGES) {
    console.log(`   - locales/${pagePath}.${lang.code}.json`);
  }
}

// Run main function
main().catch(error => {
  console.error('\n❌ Error:', error.message);
  process.exit(1);
});
