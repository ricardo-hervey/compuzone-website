# Sistema de Integridad de Archivos (SIA)

## Objetivo del Proyecto

Desarrollar un sistema modular en C++ capaz de detectar cambios en archivos mediante funciones hash criptográficas (SHA256) y comparación contra un baseline previamente almacenado en una base de datos SQLite.

El sistema permite identificar modificaciones en archivos críticos simulando técnicas reales utilizadas en herramientas de ciberseguridad para monitoreo de integridad de archivos (File Integrity Monitoring).

## Descripción Técnica

Operaciones principales del sistema:

- Lectura de archivos del sistema
- Generación de hash SHA256 del contenido
- Almacenamiento del baseline inicial en base de datos SQLite
- Comparación de hashes en ejecuciones posteriores
- Detección de modificaciones en uno o múltiples archivos
- Clasificación del estado del archivo y reporte del resultado
- Lectura de parámetros del sistema desde archivo de configuración externo (`data/config.txt`)

Módulos del sistema:

- **File Scanner** — Lectura del archivo objetivo y verificación de existencia
- **Hash Engine** — Generación del hash SHA256 mediante OpenSSL
- **Baseline Manager** — Creación, lectura y actualización del baseline en SQLite
- **Risk Analyzer** — Evaluación y clasificación del estado del archivo

## Estados Detectados

- `NEW` — Archivo monitoreado por primera vez
- `UNCHANGED` — Archivo sin modificaciones respecto al baseline
- `MODIFIED` — Archivo modificado respecto al baseline
- `DELETED` — Archivo previamente registrado que ya no existe

## Dependencias

    sudo apt install build-essential libsqlite3-dev libssl-dev

## Compilación

Comando exacto:

    make

Esto genera tres ejecutables:

- `./file_monitor` — Ejecutable principal en la raíz del repositorio, utilizado para ejecución y pruebas generales.
- `./bin/file_monitor_debug` — Binario compilado con símbolos de depuración (`-g`), utilizado para análisis estático e ingeniería inversa.
- `./bin/file_monitor_release` — Binario optimizado (`-O2`) y procesado con `strip` (sin símbolos), utilizado para comparación en reversing.

Para limpiar los binarios generados:

    make clean

## Ejecución

Comando exacto:

    ./file_monitor

O bien, utilizando el binario con símbolos:

    ./bin/file_monitor_debug

Al iniciar, el programa presenta un menú interactivo:

    ===== File Integrity Monitor =====

    1. Run Monitor
    2. Restore Test Environment
    3. Exit

    Select an option:

- **Opción 1 — Run Monitor:** Procesa los archivos listados en `data/targets.txt`, genera o compara sus hashes SHA256 contra el baseline en SQLite y reporta el estado de cada uno en una tabla.
- **Opción 2 — Restore Test Environment:** Restaura el entorno de prueba al estado inicial.
- **Opción 3 — Exit:** Cierra el programa.

Para agregar archivos al monitoreo, incluir su ruta dentro de `data/targets.txt`.

## Reporte Final y Video Demo

- Reporte técnico final: disponible en `docs/report_final.pdf`
- Video demostrativo: [Ver en YouTube](https://www.youtube.com/watch?v=UgjDE3oR5Jk)

## Estructura del Proyecto

    PIA_Sistema_Integridad_Archivos/
    │
    ├── README.md
    ├── METADATA.md
    ├── Makefile
    ├── .gitignore
    ├── file_monitor
    │
    ├── src/
    │   ├── main.cpp
    │   ├── file_scanner.cpp
    │   ├── hash_engine.cpp
    │   ├── baseline_manager.cpp
    │   └── risk_analyzer.cpp
    │
    ├── include/
    │   ├── file_scanner.h
    │   ├── hash_engine.h
    │   ├── baseline_manager.h
    │   └── risk_analyzer.h
    │
    ├── bin/
    │   ├── file_monitor_debug
    │   └── file_monitor_release
    │
    ├── docs/
    │   ├── design.md
    │   ├── roadmap.md
    │   ├── tests.md
    │   ├── report_final.pdf
    │   └── project_overview.md
    │
    ├── analysis/
    │   ├── strings.txt
    │   ├── reversing_notes.md
    │   └── functions.md
    │
    ├── evidence/
    │   ├── 1er_Avance/
    │   ├── 2do_Avance/
    │   └── Entrega_Final/
    │
    └── data/
        ├── config.txt
        ├── notes.txt
        ├── system.conf
        ├── temp.log
        └── targets.txt

## Integrantes y Responsabilidades Técnicas

- **Josué Castro Aguilar** — Arquitectura principal del sistema, manejo de la base de datos SQLite y generación del baseline.
- **Marco Vargas** — Desarrollo del módulo de hashing (SHA256 / OpenSSL) y análisis estático / reversing mediante Ghidra.
- **Ricardo Estrada García** — Lógica de procesamiento de archivos, documentación técnica y registro del entorno de ejecución.
- **Sergio Sepúlveda Rodríguez** — Revisión del repositorio, organización de evidencias, pruebas funcionales y video demostrativo.

## Tecnologías Utilizadas

**Lenguaje:** C++17

**Herramientas:**

- g++
- GNU Make
- Git / GitHub
- Visual Studio Code
- REMnux (Máquina Virtual sobre VMware Workstation)
- SQLite 3
- OpenSSL (SHA256)
- Ghidra (análisis estático / ingeniería inversa)

## Estado del Proyecto

**Fase:** Entrega Final — Sistema completo con hashing criptográfico, persistencia SQLite y configuración externa.

El sistema:

- Compila correctamente mediante `make`
- Genera tres ejecutables (raíz, debug y release con `strip`)
- Calcula hashes SHA256 mediante OpenSSL
- Crea y actualiza el baseline en SQLite
- Detecta y clasifica cambios en múltiples archivos
- Carga parámetros desde `data/config.txt`
