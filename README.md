# Sistema de Integridad de Archivos (SIA)
## Objetivo del Proyecto

Desarrollar un sistema modular en C++ capaz de detectar cambios en archivos mediante el uso de funciones hash y comparación contra un baseline previamente almacenado.

El sistema permite identificar modificaciones en archivos críticos simulando técnicas reales utilizadas en herramientas de ciberseguridad para monitoreo de integridad de archivos.

---

## Descripción Técnica

Este proyecto implementa un **Sistema de Integridad de Archivos (SIA)** desarrollado en C++, bajo una arquitectura modular.

El sistema realiza las siguientes operaciones:

* Leer archivos del sistema
* Generar un valor hash representativo del contenido
* Guardar un baseline inicial en base de datos SQLite
* Comparar hashes en ejecuciones posteriores
* Detectar modificaciones en uno o múltiples archivos
* Clasificar el estado del archivo y reportar el resultado

Los módulos principales del sistema son:

* **File Scanner:** Lectura del archivo objetivo y verificación de existencia
* **Hash Engine:** Generación del hash del contenido por bloques
* **Baseline Manager:** Creación, lectura y actualización del Baseline en SQLite
* **Risk Analyzer:** Evaluación del estado del archivo

---

## Alcance y Límites

### Alcance (Segundo Avance)

El sistema actualmente es capaz de:

* Monitorear múltiples archivos de forma dinámica
* Generar un hash del contenido por bloques
* Crear un baseline inicial si no existe
* Comparar hashes en ejecuciones posteriores
* Detectar modificaciones en los archivos monitoreados
* Mostrar el estado del archivo:

```
SAFE
MODIFIED
NEW
```

* Persistir el baseline mediante SQLite
* Compilar correctamente mediante Makefile
* Generar binario con símbolos y binario sin símbolos (strip)
* Ejecutarse en entorno Linux dentro de una Máquina Virtual

---

### Límites (Segundo Avance)

No se implementa aún:

* Uso de algoritmos criptográficos (SHA256)
* Configuración mediante archivos externos
* Monitoreo periódico automático

Estas funcionalidades se desarrollarán en la entrega final.

---

## Dependencias

```bash
sudo apt install build-essential libsqlite3-dev
```

---

## Compilación

Para compilar el proyecto:

```bash
make
```

Esto generará los ejecutables en `/bin`:

```
bin/file_monitor          # versión con símbolos (debug)
bin/file_monitor_strip    # versión sin símbolos (release)
```

---

## Ejecución

Para ejecutar el programa:

```bash
./bin/file_monitor
```

Para analizar un archivo específico:

```bash
./bin/file_monitor <ruta/al/archivo>
```

El programa reportará el estado del archivo analizado.

---

## Estructura del Proyecto

```text
PIA_Sistema_Integridad_Archivos/
│
├── README.md
├── Makefile
├── .gitignore
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
│   ├── file_monitor
│   └── file_monitor_strip
│
├── docs/
│   ├── design.md
│   ├── roadmap.md
│   ├── tests.md
│   └── report_draft.md
│
├── analysis/
│   ├── strings_output.txt
│   └── reversing_notes.md
│
├── evidence/
│
└── data/
    ├── test_file.txt
    └── baseline.db
```

---

## Integrantes y Responsabilidades Técnicas

Ricardo Hervey Estrada Garcia — File Scanner
Responsable de la lectura de archivos y verificación de existencia.

Marco Antonio Guadalupe — Hash Engine
Responsable de la generación del hash del contenido del archivo por bloques.

Josue Israel Castro Aguilar — Baseline Manager e Integración
Responsable del almacenamiento y comparación del baseline en SQLite.

Sergio Pedro Sepulveda Rodriguez — Risk Analyzer
Responsable de la interpretación del estado del archivo.

---

## Tecnologías Utilizadas

Lenguaje:

C++

Herramientas:

* g++
* Make
* Git
* Github
* Visual Studio Code
* Ubuntu Virtual Machine
* SQLite

---

## Estado Actual del Proyecto

Fase:

Segundo Avance - Monitoreo Multiarchivo con Persistencia SQLite

El sistema actualmente:

* Compila correctamente
* Ejecuta sin errores
* Genera Hashes por bloques
* Crea y actualiza Baseline en SQLite
* Detecta modificaciones en múltiples archivos
* Produce binarios debug y release

---

## Notas Técnicas

El sistema utiliza actualmente un algoritmo de hash basado en procesamiento por bloques con manejo mediante `std::string` para mantener compatibilidad con futuras mejoras criptográficas.

La persistencia del baseline migró de archivo plano hacia almacenamiento estructurado utilizando SQLite, permitiendo soporte multiarchivo y consultas eficientes.

En la fase final del proyecto se contempla la integración de algoritmos criptográficos más robustos como SHA256 mediante OpenSSL.

El sistema se encuentra preparado para escalabilidad, monitoreo automático y clasificación avanzada de eventos.
