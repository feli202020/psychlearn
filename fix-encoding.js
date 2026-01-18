// fix-encoding.js
// Encoding Fixer für PsychoLearn Projekt
// Behebt UTF-8 Encoding-Probleme in allen .tsx und .ts Dateien

const fs = require('fs');
const path = require('path');

// Mapping von falsch kodierten Zeichen zu korrekten Zeichen
const REPLACEMENTS = {
  'Ã¤': 'ä',
  'Ã¶': 'ö',
  'Ã¼': 'ü',
  'Ã„': 'Ä',
  'Ã–': 'Ö',
  'Ãœ': 'Ü',
  'ÃŸ': 'ß',
  'Ã©': 'é',
  'Ã¨': 'è',
  'Ã ': 'à',
  'fÃ¼r': 'für',
  'Ã¼ber': 'über',
  'Ã¼bersichtlich': 'übersichtlich',
  'SchlieÃŸe': 'Schließe',
  'SpaÃŸ': 'Spaß',
  'Ãœbungen': 'Übungen',
  'ðŸ§ ': '🧠',
  'ðŸ'œ': '💜',
  'ðŸŽ"': '🎓',
  'ðŸ"š': '📚',
  'ðŸ'¡': '💡',
  'âœ…': '✅',
  'â­': '⭐',
};

// Rekursiv alle Dateien in einem Verzeichnis finden
function findFiles(dir, pattern, exclude = ['node_modules', '.next', 'dist', 'build']) {
  let results = [];
  
  if (!fs.existsSync(dir)) return results;
  
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    // Überspringe ausgeschlossene Verzeichnisse
    if (stat.isDirectory()) {
      if (!exclude.includes(file)) {
        results = results.concat(findFiles(filePath, pattern, exclude));
      }
    } else if (stat.isFile() && pattern.test(file)) {
      results.push(filePath);
    }
  }
  
  return results;
}

// Behebt Encoding-Probleme in einer einzelnen Datei
function fixFile(filepath) {
  try {
    let content = fs.readFileSync(filepath, 'utf8');
    const originalContent = content;
    
    // Ersetze alle bekannten Encoding-Probleme
    for (const [wrong, correct] of Object.entries(REPLACEMENTS)) {
      content = content.replaceAll(wrong, correct);
    }
    
    // Nur schreiben wenn sich was geändert hat
    if (content !== originalContent) {
      fs.writeFileSync(filepath, content, 'utf8');
      console.log(`✅ Fixed: ${filepath}`);
      return true;
    } else {
      console.log(`⏭️  Skipped: ${filepath} (no issues)`);
      return false;
    }
  } catch (error) {
    console.error(`❌ Error in ${filepath}:`, error.message);
    return false;
  }
}

// Hauptfunktion
function main() {
  console.log('🔧 PsychoLearn Encoding Fixer');
  console.log('='.repeat(50));
  
  // Finde alle .tsx und .ts Dateien
  const pattern = /\.(tsx?|ts)$/;
  const projectRoot = process.cwd();
  
  console.log(`\n📁 Durchsuche: ${projectRoot}`);
  
  const filesToFix = findFiles(projectRoot, pattern);
  
  console.log(`\n📄 Gefundene Dateien: ${filesToFix.length}`);
  
  // Fixe alle Dateien
  let fixedCount = 0;
  for (const filepath of filesToFix) {
    if (fixFile(filepath)) {
      fixedCount++;
    }
  }
  
  console.log('\n' + '='.repeat(50));
  console.log(`✨ Fertig! ${fixedCount} von ${filesToFix.length} Dateien wurden korrigiert.`);
}

// Script ausführen
main();
