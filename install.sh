#!/bin/bash
set -e

#################################################
# Raspberry Pi Monitor - Idiotensichere Installation
# Version: 0.1.0
# Author: Martin Pfeffer
#################################################

# Farben für bessere Lesbarkeit
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Konfiguration
APP_NAME="raspi-monitor"
APP_DIR="/home/pi/apps/$APP_NAME"
SERVICE_NAME="raspi-monitor"
DB_NAME="raspi_monitor"
NODE_MIN_VERSION="18"
DEFAULT_PORT="4999"
BACKUP_DIR="/opt/backup/raspi-monitor-$(date +%Y%m%d-%H%M%S)"

# Flags
DRY_RUN=false
FORCE_INSTALL=false
SKIP_DEPS=false
VERBOSE=false

#################################################
# Hilfsfunktionen
#################################################

log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

log_step() {
    echo -e "${PURPLE}🔄 $1${NC}"
}

log_verbose() {
    if [[ "$VERBOSE" == true ]]; then
        echo -e "${CYAN}🔍 $1${NC}"
    fi
}

print_banner() {
    echo -e "${CYAN}"
    echo "╔══════════════════════════════════════════════════════════════════╗"
    echo "║                    🍓 Raspberry Pi Monitor                        ║"
    echo "║                  Idiotensichere Installation                     ║"
    echo "║                        Version 0.1.0                            ║"
    echo "╚══════════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
}

show_help() {
    echo "Verwendung: $0 [OPTIONEN]"
    echo ""
    echo "Optionen:"
    echo "  --dry-run         Nur zeigen was gemacht würde, ohne Änderungen"
    echo "  --force           Neuinstallation erzwingen (überschreibt existierende Installation)"
    echo "  --skip-deps       Abhängigkeiten-Installation überspringen"
    echo "  --verbose         Detaillierte Ausgaben anzeigen"
    echo "  --port PORT       Custom Port (Standard: $DEFAULT_PORT)"
    echo "  --help            Diese Hilfe anzeigen"
    echo ""
    echo "Beispiele:"
    echo "  $0                 # Normale Installation"
    echo "  $0 --dry-run       # Nur testen, ohne Installation"
    echo "  $0 --force         # Neuinstallation erzwingen"
    echo "  $0 --port 5000     # Installation mit Port 5000"
}

#################################################
# System-Prüfungen
#################################################

check_system() {
    log_step "System-Anforderungen prüfen..."
    
    # Raspberry Pi prüfen
    if ! grep -q "Raspberry Pi" /proc/cpuinfo 2>/dev/null; then
        log_warning "Nicht auf einem Raspberry Pi. Installation kann trotzdem fortgesetzt werden."
    else
        log_success "Raspberry Pi erkannt"
    fi
    
    # OS prüfen
    if [[ -f /etc/os-release ]]; then
        . /etc/os-release
        log_verbose "OS: $NAME $VERSION"
    fi
    
    # Root-Rechte prüfen
    if [[ $EUID -eq 0 ]]; then
        log_error "Dieses Script sollte NICHT als root ausgeführt werden!"
        log_info "Führe es als normaler Benutzer aus. Sudo wird bei Bedarf automatisch verwendet."
        exit 1
    fi
    
    # Sudo-Verfügbarkeit prüfen
    if ! command -v sudo &> /dev/null; then
        log_error "sudo ist nicht verfügbar. Installation abgebrochen."
        exit 1
    fi
    
    log_success "System-Prüfung abgeschlossen"
}

check_existing_installation() {
    log_step "Existierende Installation prüfen..."
    
    if [[ -d "$APP_DIR" ]]; then
        if [[ -f "$APP_DIR/package.json" ]]; then
            CURRENT_VERSION=$(cd "$APP_DIR" && node -p "require('./package.json').version" 2>/dev/null || echo "unknown")
            log_info "Existierende Installation gefunden (Version: $CURRENT_VERSION)"
            
            if [[ "$FORCE_INSTALL" == false ]]; then
                echo ""
                log_info "Was möchtest du tun?"
                echo "  1) Update durchführen (empfohlen)"
                echo "  2) Neuinstallation (überschreibt alles)"
                echo "  3) Abbrechen"
                echo ""
                read -p "Wähle eine Option (1-3): " choice
                
                case $choice in
                    1)
                        INSTALL_TYPE="update"
                        log_info "Update-Modus aktiviert"
                        ;;
                    2)
                        INSTALL_TYPE="fresh"
                        log_warning "Neuinstallation wird durchgeführt"
                        ;;
                    3)
                        log_info "Installation abgebrochen"
                        exit 0
                        ;;
                    *)
                        log_error "Ungültige Auswahl. Installation abgebrochen."
                        exit 1
                        ;;
                esac
            else
                INSTALL_TYPE="fresh"
                log_warning "Neuinstallation erzwungen"
            fi
        else
            INSTALL_TYPE="fresh"
            log_warning "Ungültiges Verzeichnis gefunden. Neuinstallation wird durchgeführt."
        fi
    else
        INSTALL_TYPE="fresh"
        log_info "Keine existierende Installation gefunden. Neuinstallation wird durchgeführt."
    fi
}

#################################################
# Abhängigkeiten installieren
#################################################

install_dependencies() {
    if [[ "$SKIP_DEPS" == true ]]; then
        log_info "Abhängigkeiten-Installation übersprungen"
        return
    fi
    
    log_step "System-Abhängigkeiten installieren..."
    
    # System Update
    if [[ "$DRY_RUN" == false ]]; then
        log_verbose "Paketlisten aktualisieren..."
        sudo apt update -qq
    else
        log_verbose "[DRY-RUN] sudo apt update"
    fi
    
    # Erforderliche Pakete
    REQUIRED_PACKAGES="curl wget git build-essential"
    
    for package in $REQUIRED_PACKAGES; do
        if ! dpkg -l | grep -q "^ii  $package "; then
            log_verbose "Installiere $package..."
            if [[ "$DRY_RUN" == false ]]; then
                sudo apt install -y "$package" > /dev/null
            else
                log_verbose "[DRY-RUN] sudo apt install -y $package"
            fi
        else
            log_verbose "$package ist bereits installiert"
        fi
    done
    
    # Node.js prüfen und installieren
    install_nodejs
    
    # PM2 installieren
    install_pm2
    
    # MariaDB installieren und konfigurieren
    install_database
    
    log_success "Alle Abhängigkeiten installiert"
}

install_nodejs() {
    log_step "Node.js prüfen..."
    
    if command -v node &> /dev/null; then
        CURRENT_NODE=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
        if [[ $CURRENT_NODE -ge $NODE_MIN_VERSION ]]; then
            log_success "Node.js v$(node -v) ist bereits installiert"
            return
        else
            log_warning "Node.js v$(node -v) ist zu alt (benötigt: v$NODE_MIN_VERSION+)"
        fi
    fi
    
    log_verbose "Node.js v$NODE_MIN_VERSION+ installieren..."
    
    if [[ "$DRY_RUN" == false ]]; then
        # NodeSource Repository hinzufügen
        curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash - > /dev/null
        sudo apt install -y nodejs > /dev/null
    else
        log_verbose "[DRY-RUN] Node.js Installation"
    fi
    
    log_success "Node.js installiert: $(node -v)"
}

install_pm2() {
    if command -v pm2 &> /dev/null; then
        log_success "PM2 ist bereits installiert"
        return
    fi
    
    log_verbose "PM2 installieren..."
    
    if [[ "$DRY_RUN" == false ]]; then
        sudo npm install -g pm2 > /dev/null
        # PM2 Startup konfigurieren
        pm2 startup | grep "sudo" | bash || true
    else
        log_verbose "[DRY-RUN] PM2 Installation"
    fi
    
    log_success "PM2 installiert"
}

install_database() {
    if systemctl is-active --quiet mariadb || systemctl is-active --quiet mysql; then
        log_success "MariaDB/MySQL ist bereits installiert und läuft"
        return
    fi
    
    log_step "MariaDB installieren..."
    
    if [[ "$DRY_RUN" == false ]]; then
        sudo apt install -y mariadb-server > /dev/null
        sudo systemctl start mariadb
        sudo systemctl enable mariadb
        
        # Sichere MariaDB Installation
        log_verbose "MariaDB sichern..."
        sudo mysql_secure_installation --use-default
    else
        log_verbose "[DRY-RUN] MariaDB Installation"
    fi
    
    log_success "MariaDB installiert und gestartet"
}

#################################################
# Backup erstellen
#################################################

create_backup() {
    if [[ "$INSTALL_TYPE" != "update" ]] || [[ ! -d "$APP_DIR" ]]; then
        return
    fi
    
    log_step "Backup der existierenden Installation erstellen..."
    
    if [[ "$DRY_RUN" == false ]]; then
        sudo mkdir -p "$BACKUP_DIR"
        sudo cp -r "$APP_DIR" "$BACKUP_DIR/"
        
        # Datenbank-Backup
        if systemctl is-active --quiet mariadb; then
            mysqldump "$DB_NAME" > "$BACKUP_DIR/database-backup.sql" 2>/dev/null || true
        fi
        
        sudo chown -R $(whoami):$(whoami) "$BACKUP_DIR"
    else
        log_verbose "[DRY-RUN] Backup nach $BACKUP_DIR"
    fi
    
    log_success "Backup erstellt: $BACKUP_DIR"
}

#################################################
# Anwendung installieren
#################################################

install_application() {
    log_step "Raspberry Pi Monitor installieren..."
    
    # Verzeichnis vorbereiten
    if [[ "$DRY_RUN" == false ]]; then
        if [[ "$INSTALL_TYPE" == "fresh" ]] && [[ -d "$APP_DIR" ]]; then
            log_verbose "Existierende Installation entfernen..."
            rm -rf "$APP_DIR"
        fi
        
        mkdir -p "$(dirname "$APP_DIR")"
        
        # Falls wir bereits im App-Verzeichnis sind (bei lokaler Installation)
        if [[ "$PWD" == "$APP_DIR" ]] || [[ "$(basename "$PWD")" == "$APP_NAME" ]]; then
            log_verbose "Lokale Installation erkannt"
        else
            # Download von GitHub falls nicht lokal
            if [[ ! -f "package.json" ]] || [[ ! -d "backend" ]]; then
                log_verbose "Von GitHub herunterladen..."
                git clone https://github.com/pepperonas/raspi-monitor.git "$APP_DIR"
                cd "$APP_DIR"
            else
                log_verbose "Lokale Dateien verwenden..."
                cp -r . "$APP_DIR/"
                cd "$APP_DIR"
            fi
        fi
    else
        log_verbose "[DRY-RUN] Installation nach $APP_DIR"
    fi
    
    # Dependencies installieren
    if [[ "$DRY_RUN" == false ]]; then
        log_verbose "NPM Dependencies installieren..."
        cd "$APP_DIR"
        npm install > /dev/null
        cd backend && npm install > /dev/null
        cd ../frontend && npm install > /dev/null
        cd ..
    else
        log_verbose "[DRY-RUN] NPM install"
    fi
    
    log_success "Anwendung installiert"
}

#################################################
# Konfiguration
#################################################

configure_application() {
    log_step "Anwendung konfigurieren..."
    
    if [[ "$DRY_RUN" == false ]]; then
        cd "$APP_DIR"
        
        # .env Datei erstellen falls sie nicht existiert
        if [[ ! -f "backend/.env" ]]; then
            log_verbose ".env Datei erstellen..."
            cat > backend/.env << EOF
# Server Configuration
PORT=$DEFAULT_PORT
NODE_ENV=production

# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_NAME=$DB_NAME
DB_USER=raspi_monitor
DB_PASSWORD=raspi_monitor_$(openssl rand -hex 8)

# Logging
LOG_LEVEL=info
LOG_FILE=logs/app.log
ERROR_LOG_FILE=logs/error.log

# Generated on $(date)
EOF
        fi
        
        # Log-Verzeichnis erstellen
        mkdir -p backend/logs
        
        # Frontend bauen
        log_verbose "Frontend bauen..."
        cd frontend
        npm run build > /dev/null
        cd ..
        
    else
        log_verbose "[DRY-RUN] Konfiguration"
    fi
    
    log_success "Anwendung konfiguriert"
}

#################################################
# Datenbank konfigurieren
#################################################

setup_database() {
    log_step "Datenbank konfigurieren..."
    
    if [[ "$DRY_RUN" == false ]]; then
        # Datenbank und Benutzer erstellen
        mysql -u root << EOF
CREATE DATABASE IF NOT EXISTS $DB_NAME;
CREATE USER IF NOT EXISTS 'raspi_monitor'@'localhost' IDENTIFIED BY '$(grep DB_PASSWORD backend/.env | cut -d'=' -f2)';
GRANT ALL PRIVILEGES ON $DB_NAME.* TO 'raspi_monitor'@'localhost';
FLUSH PRIVILEGES;
EOF
        
        # Tabellen werden automatisch beim ersten Start erstellt
    else
        log_verbose "[DRY-RUN] Datenbank-Setup"
    fi
    
    log_success "Datenbank konfiguriert"
}

#################################################
# Service starten
#################################################

start_service() {
    log_step "Service starten..."
    
    if [[ "$DRY_RUN" == false ]]; then
        cd "$APP_DIR"
        
        # PM2 Service stoppen falls läuft
        pm2 delete "$SERVICE_NAME" 2>/dev/null || true
        
        # Service starten
        pm2 start ecosystem.config.js --env production
        pm2 save
        
        # Autostart konfigurieren
        pm2 startup | grep "sudo" | bash || true
        
    else
        log_verbose "[DRY-RUN] Service starten"
    fi
    
    log_success "Service gestartet"
}

#################################################
# Installation abschließen
#################################################

finish_installation() {
    log_success "Installation abgeschlossen! 🎉"
    echo ""
    echo -e "${GREEN}╔══════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║                    ✅ Installation erfolgreich!                  ║${NC}"
    echo -e "${GREEN}╚══════════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${CYAN}🌐 Dashboard: ${YELLOW}http://$(hostname -I | awk '{print $1}'):$DEFAULT_PORT${NC}"
    echo -e "${CYAN}🌐 Lokal:     ${YELLOW}http://localhost:$DEFAULT_PORT${NC}"
    echo ""
    echo -e "${BLUE}📋 Nützliche Befehle:${NC}"
    echo -e "   ${CYAN}pm2 status${NC}           - Service-Status anzeigen"
    echo -e "   ${CYAN}pm2 logs raspi-monitor${NC} - Logs anzeigen"
    echo -e "   ${CYAN}pm2 restart raspi-monitor${NC} - Service neu starten"
    echo ""
    
    if [[ "$INSTALL_TYPE" == "update" ]]; then
        echo -e "${GREEN}🔄 Update erfolgreich durchgeführt!${NC}"
        echo -e "${BLUE}📁 Backup verfügbar unter: ${YELLOW}$BACKUP_DIR${NC}"
    fi
    
    echo -e "${PURPLE}📖 Dokumentation: ${YELLOW}https://github.com/pepperonas/raspi-monitor${NC}"
    echo ""
}

#################################################
# Argument-Parsing
#################################################

parse_arguments() {
    while [[ $# -gt 0 ]]; do
        case $1 in
            --dry-run)
                DRY_RUN=true
                log_info "Dry-Run Modus aktiviert"
                ;;
            --force)
                FORCE_INSTALL=true
                ;;
            --skip-deps)
                SKIP_DEPS=true
                ;;
            --verbose)
                VERBOSE=true
                ;;
            --port)
                DEFAULT_PORT="$2"
                shift
                ;;
            --help)
                show_help
                exit 0
                ;;
            *)
                log_error "Unbekannte Option: $1"
                show_help
                exit 1
                ;;
        esac
        shift
    done
}

#################################################
# Hauptfunktion
#################################################

main() {
    parse_arguments "$@"
    
    print_banner
    
    if [[ "$DRY_RUN" == true ]]; then
        log_warning "DRY-RUN MODUS: Keine Änderungen werden vorgenommen"
        echo ""
    fi
    
    check_system
    check_existing_installation
    
    if [[ "$INSTALL_TYPE" == "update" ]]; then
        create_backup
    fi
    
    install_dependencies
    install_application
    configure_application
    setup_database
    start_service
    
    finish_installation
}

#################################################
# Script ausführen
#################################################

# Fehlerbehandlung
trap 'log_error "Installation fehlgeschlagen in Zeile $LINENO"; exit 1' ERR

# Script starten
main "$@"