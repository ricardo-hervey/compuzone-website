# 🛡️ Sistema de Integridad de Archivos (SIA)

> Herramienta de ciberseguridad desarrollada en C++ que detecta modificaciones no autorizadas en archivos críticos del sistema, simulando técnicas reales usadas en herramientas como Tripwire y AIDE.

---

## ¿Qué problema resuelve?

En entornos de producción, un archivo modificado sin autorización puede significar un ataque en curso, malware instalado o una brecha de seguridad. El SIA responde a esa necesidad: calcula una huella digital (hash) de cada archivo, la guarda como referencia, y en cada ejecución detecta si algo cambió.

```
Primera ejecución:   archivo.txt  →  hash: 4a7f3c  →  guardado en baseline
Ejecución posterior: archivo.txt  →  hash: 9b2e1a  →  ¡ALERTA: MODIFIED!
```

---

## Arquitectura del Sistema

El SIA está diseñado de forma modular. Cada componente tiene una responsabilidad única y se comunica con el siguiente en cadena:

```
┌─────────────────┐
│   File Scanner  │  Lee el archivo y verifica que exista
└────────┬────────┘
         │
┌────────▼────────┐
│   Hash Engine   │  Procesa el contenido por bloques y genera el hash
└────────┬────────┘
         │
┌────────▼────────┐
│ Baseline Manager│  Consulta o actualiza el registro en SQLite
└────────┬────────┘
         │
┌────────▼────────┐
│  Risk Analyzer  │  Compara hashes y emite el estado final
└─────────────────┘
```

| Módulo | Archivo fuente | Responsable | Función principal |
|--------|---------------|-------------|-------------------|
| File Scanner | `file_scanner.cpp` | Ricardo Hervey | Apertura, lectura y validación del archivo objetivo |
| Hash Engine | `hash_engine.cpp` | Marco Guadalupe | Generación del hash del contenido por bloques |
| Baseline Manager | `baseline_manager.cpp` | Josue Castro | Persistencia del baseline en base de datos SQLite |
| Risk Analyzer | `risk_analyzer.cpp` | Sergio Sepúlveda | Clasificación del estado: `SAFE`, `MODIFIED`, `NEW` |

---

## Estado del Proyecto

**Fase actual:** Segundo Avance — Monitoreo multiarchivo con persistencia SQLite

| Funcionalidad | Estado |
|---------------|--------|
| Lectura y validación de archivos | ✅ Completo |
| Generación de hash por bloques | ✅ Completo |
| Baseline persistente en SQLite | ✅ Completo |
| Clasificación de estado del archivo | ✅ Completo |
| Soporte para múltiples archivos | ✅ Completo |
| Binarios debug y release en `/bin` | ✅ Completo |
| SHA-256 criptográfico (OpenSSL) | 🔲 Avance 3 |
| Monitoreo automático periódico | 🔲 Avance 3 |
| Configuración externa `.conf` | 🔲 Avance 3 |

---

## Requisitos del Sistema

| Herramienta | Versión mínima | Uso |
|-------------|---------------|-----|
| g++ | ≥ 9.0 | Compilación C++ |
| make | cualquiera | Sistema de build |
| libsqlite3-dev | ≥ 3.31 | Base de datos del baseline |

### Instalación rápida (Ubuntu/Debian)

```bash
sudo apt update && sudo apt install build-essential libsqlite3-dev
```

---

## Compilación

```bash
make
```

Genera dos binarios en `/bin`:

| Binario | Descripción |
|---------|-------------|
| `bin/file_monitor` | Versión debug — incluye símbolos para análisis |
| `bin/file_monitor_strip` | Versión release — optimizada, sin símbolos |

Para limpiar artefactos de compilación:

```bash
make clean
```

---

## Ejecución

```bash
# Analizar el archivo de prueba por defecto
./bin/file_monitor

# Analizar un archivo específico
./bin/file_monitor <ruta/al/archivo>
```

### Resultados posibles

| Estado | Significado |
|--------|-------------|
| `✅ SAFE` | El archivo no ha cambiado desde el último baseline |
| `⚠️  MODIFIED` | El hash actual no coincide — posible modificación |
| `🆕 NEW` | Archivo sin baseline previo — se registra por primera vez |

### Ejemplo de sesión completa

```bash
# Primera ejecución — crea el baseline
./bin/file_monitor data/test_file.txt
[INFO] Archivo nuevo: data/test_file.txt
[INFO] Hash generado: 4a7f3c8d
[OK]   Estado: NEW — Baseline registrado en SQLite.

# Segunda ejecución — archivo sin cambios
./bin/file_monitor data/test_file.txt
[INFO] Escaneando: data/test_file.txt
[OK]   Estado: SAFE — Sin modificaciones detectadas.

# Modificamos el archivo y volvemos a ejecutar
echo "intruso" >> data/test_file.txt
./bin/file_monitor data/test_file.txt
[INFO] Escaneando: data/test_file.txt
[WARN] Estado: MODIFIED — Hash no coincide con el baseline.
```

---

## Estructura del Repositorio

```
PIA_Sistema_Integridad_Archivos/
│
├── README.md                  → Este archivo
├── Makefile                   → Reglas de compilación
├── .gitignore
│
├── src/                       → Código fuente
│   ├── main.cpp
│   ├── file_scanner.cpp
│   ├── hash_engine.cpp
│   ├── baseline_manager.cpp
│   └── risk_analyzer.cpp
│
├── include/                   → Headers de cada módulo
│   ├── file_scanner.h
│   ├── hash_engine.h
│   ├── baseline_manager.h
│   └── risk_analyzer.h
│
├── bin/                       → Binarios compilados
│   ├── file_monitor           → Debug (con símbolos)
│   └── file_monitor_strip     → Release (sin símbolos)
│
├── data/                      → Archivos de prueba
│   ├── test_file.txt
│   └── baseline.db            → Base de datos SQLite (generada en ejecución)
│
├── docs/                      → Documentación técnica
│   ├── design.md
│   ├── roadmap.md
│   ├── tests.md
│   └── report_draft.md
│
├── analysis/                  → Análisis del binario
│   ├── strings_output.txt
│   └── reversing_notes.md
│
└── evidence/                  → Capturas de ejecución y análisis
```

---

## Seguridad y Consideraciones Técnicas

- El hash actual es **aritmético** (Avance 1 y 2). Será reemplazado por **SHA-256** en el Avance 3 para resistir colisiones intencionales.
- El baseline se almacena en `baseline.db` (SQLite). En versiones futuras se firmará digitalmente para prevenir manipulación del propio archivo de referencia.
- El binario de distribución es `file_monitor_strip` — sin símbolos, más difícil de analizar externamente.

---

## Tecnologías

`C++17` · `SQLite3` · `g++ / Make` · `Ghidra` · `Radare2` · `Git / GitHub` · `Ubuntu VM`

---

## Equipo

| Integrante | Módulo | Rol |
|------------|--------|-----|
| Ricardo Hervey Estrada Garcia | File Scanner | Lectura y validación de archivos |
| Marco Antonio Guadalupe | Hash Engine | Generación del hash por bloques |
| Josue Israel Castro Aguilar | Baseline Manager | Persistencia SQLite e integración |
| Sergio Pedro Sepúlveda Rodríguez | Risk Analyzer | Clasificación del estado del archivo |
