# METADATA — Entorno de Reproducibilidad

Este archivo documenta el entorno técnico utilizado para el desarrollo, compilación y pruebas del Sistema de Integridad de Archivos (SIA), con el objetivo de garantizar la reproducibilidad del proyecto.

## Máquina Virtual

- **Hipervisor:** VMware Workstation
- **Distribución:** REMnux (basada en Ubuntu)
- **Arquitectura:** x86_64
- **Usuario del sistema:** remnux
- **Ruta del proyecto:** ~/Downloads/PIA_Sistema_Integridad_Archivos-main

Se eligió REMnux por ser una distribución especializada en análisis de malware e ingeniería inversa, lo que facilita el análisis estático y dinámico de los binarios generados por el proyecto.

## Snapshot

- **Snapshot:** Estado funcional del entorno con el sistema compilado y los binarios finales (`file_monitor`, `bin/file_monitor_debug`, `bin/file_monitor_release`) generados correctamente.
- **Fecha de validación de la ejecución:** 21 de mayo de 2026

## Versiones de Herramientas

| Herramienta        | Versión / Referencia                  |
|--------------------|---------------------------------------|
| g++                | 11.x (GCC, paquete `build-essential`) |
| GNU Make           | 4.x                                   |
| Git                | 2.x                                   |
| SQLite 3           | 3.x (`libsqlite3-dev`)                |
| OpenSSL            | 3.x (`libssl-dev`)                    |
| Ghidra             | Incluido en REMnux                    |
| Visual Studio Code | Utilizado como editor principal       |

## Comandos de Verificación del Entorno

Para reproducir o validar las versiones exactas instaladas en el entorno:

    lsb_release -a
    uname -a
    g++ --version
    make --version
    sqlite3 --version
    openssl version
    git --version

## Notas

- El proyecto fue desarrollado y probado dentro de la máquina virtual REMnux en VMware Workstation.
- Las dependencias requeridas para compilar y ejecutar el sistema están listadas en el `README.md`.
- Los binarios finales se encuentran en `/bin` (`file_monitor_debug` con símbolos y `file_monitor_release` sin símbolos para análisis comparativo).
