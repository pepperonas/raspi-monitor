#!/usr/bin/env node

/**
 * Version Manager für Raspberry Pi Monitor
 * Automatische Versionsverwaltung und Release-Generierung
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class VersionManager {
    constructor() {
        this.rootDir = path.join(__dirname, '..');
        this.packageFiles = [
            'package.json',
            'backend/package.json',
            'frontend/package.json'
        ];
    }

    getCurrentVersion() {
        const packagePath = path.join(this.rootDir, 'package.json');
        const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
        return pkg.version;
    }

    bumpVersion(type = 'patch') {
        console.log(`🔄 Version erhöhen (${type})...`);
        
        const currentVersion = this.getCurrentVersion();
        console.log(`📋 Aktuelle Version: ${currentVersion}`);
        
        // Version in allen package.json Dateien erhöhen
        this.packageFiles.forEach(file => {
            const filePath = path.join(this.rootDir, file);
            if (fs.existsSync(filePath)) {
                try {
                    execSync(`npm version ${type} --no-git-tag-version`, {
                        cwd: path.dirname(filePath),
                        stdio: 'inherit'
                    });
                } catch (error) {
                    console.error(`❌ Fehler beim Aktualisieren von ${file}:`, error.message);
                }
            }
        });
        
        const newVersion = this.getCurrentVersion();
        console.log(`✅ Neue Version: ${newVersion}`);
        
        // README.md aktualisieren
        this.updateReadme(newVersion);
        
        return newVersion;
    }

    updateReadme(version) {
        const readmePath = path.join(this.rootDir, 'README.md');
        
        if (fs.existsSync(readmePath)) {
            let content = fs.readFileSync(readmePath, 'utf8');
            
            // Version im Changelog aktualisieren
            const currentDate = new Date().toLocaleDateString('de-DE', {
                year: 'numeric',
                month: 'long'
            });
            
            content = content.replace(
                /### Version \d+\.\d+\.\d+ \(.*? - Aktuell\)/,
                `### Version ${version} (${currentDate} - Aktuell)`
            );
            
            fs.writeFileSync(readmePath, content);
            console.log(`📝 README.md aktualisiert mit Version ${version}`);
        }
    }

    createGitTag(version) {
        try {
            // Git Änderungen committen
            execSync('git add .', { stdio: 'inherit' });
            execSync(`git commit -m "chore: bump version to v${version}

🤖 Automated version bump

Co-Authored-By: Version Manager <version@raspi-monitor.local>"`, { stdio: 'inherit' });
            
            // Git Tag erstellen
            execSync(`git tag -a "v${version}" -m "Release v${version}"`, { stdio: 'inherit' });
            
            console.log(`🏷️  Git Tag v${version} erstellt`);
            return true;
        } catch (error) {
            console.error(`❌ Fehler beim Git-Tag:`, error.message);
            return false;
        }
    }

    pushToGitHub() {
        try {
            execSync('git push origin main', { stdio: 'inherit' });
            execSync('git push --tags', { stdio: 'inherit' });
            console.log(`🚀 Änderungen zu GitHub gepusht`);
            return true;
        } catch (error) {
            console.error(`❌ Fehler beim Push:`, error.message);
            return false;
        }
    }

    generateChangelog() {
        // Einfaches Changelog basierend auf Git Commits
        try {
            const lastTag = execSync('git describe --tags --abbrev=0 HEAD~1', { encoding: 'utf8' }).trim();
            const commits = execSync(`git log ${lastTag}..HEAD --oneline`, { encoding: 'utf8' });
            
            const changelog = commits
                .split('\n')
                .filter(line => line.trim())
                .map(line => `- ${line.split(' ').slice(1).join(' ')}`)
                .join('\n');
            
            return changelog;
        } catch (error) {
            return '- Erste Release oder Fehler beim Generieren des Changelogs';
        }
    }

    showStatus() {
        console.log('\n📊 Raspberry Pi Monitor - Version Status\n');
        console.log('═'.repeat(50));
        
        const currentVersion = this.getCurrentVersion();
        console.log(`📋 Aktuelle Version: ${currentVersion}`);
        
        // Git Status
        try {
            const gitStatus = execSync('git status --porcelain', { encoding: 'utf8' });
            if (gitStatus.trim()) {
                console.log('📝 Uncommitted Änderungen gefunden:');
                console.log(gitStatus);
            } else {
                console.log('✅ Arbeitsverzeichnis ist sauber');
            }
        } catch (error) {
            console.log('❌ Git Status konnte nicht abgerufen werden');
        }
        
        // Package Versionen prüfen
        console.log('\n📦 Package Versionen:');
        this.packageFiles.forEach(file => {
            const filePath = path.join(this.rootDir, file);
            if (fs.existsSync(filePath)) {
                const pkg = JSON.parse(fs.readFileSync(filePath, 'utf8'));
                console.log(`  ${file}: ${pkg.version}`);
            }
        });
        
        console.log('\n' + '═'.repeat(50));
    }
}

// CLI Interface
const args = process.argv.slice(2);
const command = args[0];
const versionType = args[1] || 'patch';

const vm = new VersionManager();

switch (command) {
    case 'status':
        vm.showStatus();
        break;
        
    case 'bump':
        if (!['major', 'minor', 'patch'].includes(versionType)) {
            console.error('❌ Ungültiger Versionstyp. Verwende: major, minor, oder patch');
            process.exit(1);
        }
        const newVersion = vm.bumpVersion(versionType);
        console.log(`\n🎉 Version erfolgreich auf ${newVersion} erhöht!`);
        break;
        
    case 'release':
        const releaseVersion = vm.bumpVersion(versionType);
        console.log('\n🚀 Release wird erstellt...');
        
        if (vm.createGitTag(releaseVersion)) {
            if (vm.pushToGitHub()) {
                console.log(`\n🎉 Release v${releaseVersion} erfolgreich erstellt und gepusht!`);
                console.log(`📋 GitHub Actions wird automatisch eine Release erstellen.`);
                console.log(`🌐 Überprüfe: https://github.com/pepperonas/raspi-monitor/releases`);
            }
        }
        break;
        
    case 'changelog':
        const changelog = vm.generateChangelog();
        console.log('\n📋 Changelog seit letzter Version:\n');
        console.log(changelog);
        break;
        
    default:
        console.log(`
🔧 Raspberry Pi Monitor - Version Manager

Verwendung:
  node scripts/version-manager.js <command> [options]

Befehle:
  status                    - Aktuellen Status anzeigen
  bump [patch|minor|major]  - Version erhöhen (Standard: patch)
  release [patch|minor|major] - Version erhöhen, taggen und pushen
  changelog                 - Changelog seit letzter Version anzeigen

Beispiele:
  node scripts/version-manager.js status
  node scripts/version-manager.js bump patch
  node scripts/version-manager.js release minor
        `);
        break;
}