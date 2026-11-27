# Matriz Contable CR 🇨🇷

**Hoja de cálculo contable con herramientas fiscales de Costa Rica**, facturación electrónica ante Hacienda y **Sibö ✦**, un asistente de IA. Disponible en Android, iPhone y web.

Versión de la app: `39.1.0` · Paquete Android: `com.kenychinchilla.matrizcontable`
Diseño y programación: **Keny Chinchilla Navarro (KCN Studio)**

> Software propietario. Todos los derechos reservados. Ver [LICENSE](./LICENSE).
> Guía de uso completa (15 páginas): [`Guia_Matriz_Contable_CR.pdf`](./docs/Guia_Matriz_Contable_CR.pdf)

---

## Para quién es

| Ruta | Perfil | Qué usa |
| --- | --- | --- |
| **A · Solo la matriz** | Quien necesita una hoja de cálculo potente: presupuestos, listas, gráficos, tablas dinámicas, plantillas, respaldo | La hoja, sin nada de Costa Rica si no quiere |
| **B · Contadores** | Quien lleva libros de uno o varios negocios en Costa Rica | Catálogo, Diario, IVA, planilla CCSS, cierres, NIIF, factura electrónica |

Las etiquetas de esta documentación: **CR** = pensado para la normativa de Costa Rica · **UNIVERSAL** = sirve en cualquier país · **PRO** = incluido en el plan Pro.

---

## Los 4 módulos

Al iniciar sesión aparece la pantalla de inicio con cuatro tarjetas:

| Módulo | Para qué sirve | Alcance |
| --- | --- | --- |
| 📊 **Nueva Hoja** | La matriz: hoja de cálculo con ribbon (menú de pestañas), fórmulas, gráficos, tablas dinámicas, plantillas y herramientas contables | UNIVERSAL + CR |
| 🧾 **Factura Electrónica** | Configura el certificado y las credenciales de Hacienda para emitir y firmar comprobantes (XML + PDF) | CR · PRO |
| **fx Biblioteca de Funciones** | Catálogo de 452 funciones con buscador, alias en inglés y categorías. Incluye 11 funciones "Financieras CR" | UNIVERSAL |
| ✦ **Sibö, asistente IA** | Responde dudas contables, sugiere fórmulas que se insertan en la celda y, dentro de la hoja, puede leer tus datos | UNIVERSAL con enfoque CR · PRO |

**Otras características generales**
- **Funciona sin internet** (*offline first*): los cambios se guardan en el dispositivo y se sincronizan al volver la señal.
- **Libros en la nube** (con cuenta): guardar, compartir y recuperar libros desde otro teléfono.
- **Idiomas:** español, inglés y seis lenguas indígenas de Costa Rica (bribri, cabécar, ngäbe, boruca, térraba y maleku), más un diccionario indígena colaborativo.
- **Importar / exportar:** Excel, CSV/TXT, PDF (con logo, encabezado, pie y marca de agua), XML de Hacienda y copia de respaldo `.json`.

---

## Costa Rica vs. cualquier zona

### 🇨🇷 Diseñado para Costa Rica
- **IVA** con tarifas 13 %, 4 %, 2 %, 1 % y exento; borrador del **D-104**.
- **Planilla CCSS / renta de salarios** con tasas y tramos 2026, aguinaldo, preaviso y cesantía.
- **Factura electrónica** de Hacienda: XML firmado, claves de 50 dígitos, CABYS, mensaje receptor, notas de crédito/débito.
- **Padrón de Hacienda** (consulta de cédulas) y **tipo de cambio** oficial (Hacienda / BCCR).
- **Vencimientos fiscales**: D-104, D-101, D-151, CCSS, pagos parciales de renta y régimen simplificado.
- Moneda por defecto colón (₡), formato de cédulas y teléfonos de 8 dígitos.
- Funciones "Financieras CR": `IVA.INCLUIDO`, `PLANILLA.CCSS`, `AGUINALDO`, `PREAVISO`, `CESANTIA`, `RENTA.TRABAJO`, `TIPO.CAMBIO`…
- Plantillas: D-151 Compras y Ventas y catálogos por tipo de negocio (comercio, servicios, soda, agro, construcción).

### 🌎 Sirve en cualquier zona
- **Hoja de cálculo completa:** formato, fórmulas, rellenos, ordenar, filtros, congelar paneles, comentarios.
- **452 funciones** documentadas (matemáticas, texto, fecha, lógicas, búsqueda, estadística, financieras VA/VF/TIR/PAGO…).
- **Más de 30 tipos de gráfico**, tablas dinámicas, formato condicional, validación de datos, escenarios y buscar objetivo.
- **Libro Diario, Mayor, Balanza, Kárdex y Activos fijos** (partida doble) y estados NIIF para PYMES.
- **Conciliación bancaria** con extractos `.csv` / `.xlsx`.
- Importar/exportar, respaldos y versiones; Face ID / huella, cifrado con contraseña, hojas protegidas y roles.
- Monedas ₡, $ y €; 8 idiomas; macros.
- Colaboración: compartir, comentarios y control de cambios.

**¿Y fuera de Costa Rica?** Usa la matriz como hoja de cálculo y libro contable general. Las herramientas marcadas **CR** (D-104, CCSS, Hacienda, factura electrónica, vencimientos) aplican normativa costarricense: **no las uses para declarar en otro país**. El catálogo de cuentas es editable para adaptarlo a un plan contable local.

---

## Planes

| Siempre gratis | Plan Pro |
| --- | --- |
| Hoja de cálculo completa, más de 750 fórmulas, gráficos, plantillas contables, planilla, IVA, D-101 y guardar en la nube | Factura Electrónica de Hacienda · Sibö y funciones con IA · compartir, permisos, avisos y trabajo en equipo · publicar en la web y formularios públicos · datos de Hacienda vinculados (cédulas, padrón) |

**US$21 al mes**, cobro automático por PayPal o tarjeta. Al crear la cuenta hay **1 mes de Pro gratis sin tarjeta**. Los precios y el alcance pueden cambiar: confirma en el panel "Planes" de la app.

---

## Primeros pasos

1. **Crea tu cuenta o inicia sesión** (nombre, correo y contraseña). Es necesaria para la nube, la factura electrónica y Sibö; la hoja básica también funciona localmente.
2. **Mira el tutorial** de bienvenida (5 pasos). Se reabre con el botón ❔ de la pantalla de inicio.
3. **Elige el idioma** desde el botón de idioma o desde `⋯ → Idioma`.
4. **Activa el bloqueo biométrico** (Face ID / huella / PIN) en *Mi perfil*.
5. **Permite las notificaciones** para los recordatorios de vencimientos fiscales (3 días antes y el mismo día).

---

## Ruta A · Usar la matriz como hoja de cálculo

**Abrir y crear:** *Nuevo* (libro en blanco o *desde plantilla*: Diario, Mayor, Balance de Comprobación, Conciliación Bancaria, D-151…), *Abrir Excel* (`.xlsx` / Numbers, CSV/TXT, "Desde PDF") y *Mis libros* (nube y compartir por correo).

**El ribbon (☰):**

| Pestaña | Qué encuentras |
| --- | --- |
| Inicio | Deshacer/rehacer, historial, copiar/pegar, pegado especial, rellenar, buscar, formato (negrita, ₡, %, relleno, combinar), formato condicional, validación, notas y notas de voz |
| Insertar | Tablas, gráficos, imágenes, formas, SmartArt, ecuaciones, firma, controles, vínculos, segmentadores |
| Fórmulas | Cálculo automático/manual, autosuma, administrador de nombres, "Mis funciones", evaluar fórmula, precedentes/dependientes, comprobar errores |
| Datos | Ordenar, series, autofiltro, quitar duplicados, subtotales, texto en columnas, tabla dinámica, consultas, hoja de previsión, tabla de datos |
| Revisar | Comentarios, ortografía, dictado, leer celdas, rangos protegidos, personas y permisos, control de cambios, auditoría |
| Vista / Archivo | Zoom, cuadrícula, paneles, diseño de página; CSV, Excel, PDF, importar, versiones y backups, bloqueo Face ID, cifrado |

> **Truco:** cada panel tiene un buscador **"Buscar herramienta…"**. Escribe "dinámica", "pdf" o "iva" y aparece el botón.

**Funciones más usadas**

| Necesito… | Función | Ejemplo |
| --- | --- | --- |
| Sumar con condición | `SUMAR.SI` | `=SUMAR.SI(A:A;"Comida";B:B)` |
| Buscar un precio | `BUSCARV` / `BUSCARX` | `=BUSCARV(D2;Precios!A:B;2;0)` |
| Decidir | `SI` | `=SI(B2>1000;"Alto";"Normal")` |

**Sibö** (PRO): pregunta "¿cuánto suma la columna B?" o "dame una fórmula para el promedio por mes". Cuando Sibö propone una fórmula en su propia línea que empieza con `=`, la app ofrece insertarla en la celda seleccionada.

---

## Ruta B · Flujo de trabajo contable, mes a mes

Todo vive en el ribbon `☰ → 🇨🇷 Contabilidad CR`. La primera vez que uses una herramienta que necesita libros, la app propone crear las hojas **Catálogo, Diario, Mayor y Balanza**.

1. **Configura el catálogo.** *Catálogo por negocio* añade cuentas de Comercio, Servicios profesionales, Restaurante/Soda, Agro o Construcción (hasta 58 cuentas).
2. **Registra el Diario.** Fecha, N.° de asiento, código de cuenta, Debe y Haber. Los asientos deben cuadrar. Las compras se cargan con *Leer XML de compras* / *Importar XML* o *Registrar compra*.
3. **Asientos de facturas.** Convierte los comprobantes emitidos a Hacienda en asientos del Diario.
4. **Conciliación bancaria.** Sube el estado de cuenta (`.csv` / `.xlsx`); marca *Conciliado*, *Agrupado*, *Revisar*, *Solo en banco* o *Solo en libros*.
5. **Inventarios y activos.** *Kárdex* (costo promedio ponderado) y *Activos fijos* (depreciación en línea recta, asiento mensual, baja).
6. **Revisa Mayor y Balance.** *Mayor Auto*, *Balance Auto*, *Flujo Efectivo*, *Estados financieros*, *Ratios* y *Comparativo* salen del Diario.

### Impuestos, planilla y cierres (CR)
- **IVA y D-104:** lee la hoja activa (*Fecha, Tipo, Base*, y opcionalmente *Tasa* o *IVA*), separa ventas y compras por tarifa, aplica proporcionalidad del crédito y calcula el IVA a pagar o el saldo a favor.
- **Planilla CCSS / Renta de salarios:** salario neto, CCSS del trabajador y patronal, renta por tramos 2026, costo total y provisión de aguinaldo. "Crear hoja Planilla" genera una hoja con fórmulas para varios empleados.
- **Cierre mensual:** verifica movimientos, que los asientos cuadren, cuentas válidas y comprobantes con asiento. Al cerrar, el mes queda **bloqueado**.
- **Reporte para el contador** (PDF mensual), **EEFF NIIF PYMES** (5 estados), **Cierre anual** y **Régimen simplificado** (formularios 104 y 153).

### Factura electrónica (CR · PRO)

**Configuración inicial (una vez por emisor):**
1. Elige el ambiente: **sandbox** (pruebas) o **producción**.
2. Sube el certificado de firma (`.p12`) o pega su contenido en Base64, con su contraseña.
3. Ingresa cédula del emisor, usuario y contraseña de Hacienda y la actividad económica.
4. Completa la dirección (provincia, cantón, distrito, otras señas).

El certificado y las credenciales se guardan **cifrados en un servicio aparte**, no en el teléfono. Se admiten varios emisores por cuenta y varios usuarios por negocio mediante un código de negocio.

| Acción | Detalle |
| --- | --- |
| Factura / tiquete | Emisor, receptor, líneas con CABYS e IVA; condición de venta (contado, crédito). Firmar y Enviar, Consultar estado, XML, PDF, Imprimir |
| Nota de crédito / débito | Anula o corrige; la de débito cobra un monto adicional |
| Mensaje receptor | Acepta (total o parcial) o rechaza un comprobante recibido |
| Recibo de pago | Comprobante de cobro de facturas a crédito |
| Pendientes | Si Hacienda no confirma en ~55 s queda "pendiente"; la app lo recuerda a los 20 minutos y un proceso automático también la revisa |
| Cobranza | Cuentas por cobrar, facturas recurrentes y cobro por WhatsApp |
| Historial | Borradores, enviadas, recibidas, reportes y exportación CSV |

### Vencimientos que la app conoce (CR)

| Obligación | Fecha |
| --- | --- |
| Cierre contable del mes anterior | Día 3 de cada mes |
| CCSS: presentar la planilla | Hasta el 4.° día |
| CCSS: pagar la planilla | Día 20 |
| IVA D-104 | Día 15 de cada mes |
| Pagos parciales de renta | 30 de junio, 30 de setiembre y 31 de diciembre |
| D-151 declaración informativa | 28 de febrero |
| Renta anual D-101 | 15 de marzo |
| Régimen simplificado | Día 15 de enero, abril, julio y octubre |
| Aguinaldo | A más tardar el 20 de diciembre |

"Al calendario del teléfono" genera un archivo `.ics` con eventos repetidos y avisos.

### Trabajo en equipo y seguridad
Compartir libros por correo, comentarios con menciones, control de cambios e historial por celda, permisos por hoja (editar / comentar / ver), rangos protegidos, ocultar fórmulas, cifrado con contraseña, sellado del libro y auditoría. *Clientes y proveedores* con cédula para facturar rápido y *Padrón Hacienda* (PRO).

---

## Valores precargados para Costa Rica

Son editables donde se indica. **Verifícalos cada año** en hacienda.go.cr y ccss.sa.cr.

| Concepto | Valor que usa la app |
| --- | --- |
| IVA | 13 % general · 4 % canasta básica/otros · 2 % medicamentos · 1 % equipo médico · 0 % exento |
| CCSS trabajador | 10,83 % (editable) |
| CCSS patrono | 26,83 % (editable) |
| Renta de salarios 2026 (mensual) | Exento hasta ₡918.000; 10 % hasta ₡1.347.000; 15 % hasta ₡2.364.000; 20 % hasta ₡4.727.000; 25 % el resto |
| Créditos fiscales | ₡1.710 por hijo · ₡2.590 por cónyuge |
| Aguinaldo | Suma de salarios de diciembre a noviembre ÷ 12; provisión mensual 1/12 |
| Moneda | Colón (₡), con $ y € disponibles; tipo de cambio oficial (requiere internet) |
| Marco contable | NIIF para PYMES |

> Las tarifas y fechas cambian con las leyes. Esta herramienta no sustituye el criterio profesional ni la normativa oficial.

**Privacidad:** el corrector ortográfico envía los textos de las celdas a un servicio externo (LanguageTool); no lo uses en hojas con datos que no quieras compartir. Sibö envía tu pregunta (y, dentro de la hoja, el contexto de celdas) a su servidor de IA.

---

## Preguntas frecuentes

- **¿Necesito internet?** No para la hoja y el libro contable. Sí para iniciar sesión, nube, Sibö, tipo de cambio, padrón, factura electrónica, corrector ortográfico y compartir.
- **Una herramienta me pide "Diario" o "Catálogo".** Acepta crear el sistema contable o usa *Nuevo desde plantilla → Libro Diario*.
- **El cierre mensual marca ⚠ en "líneas sin cuenta".** Un código del Diario no existe en el Catálogo: agrégalo o corrige el código.
- **Los asientos no cuadran.** Corrige los asientos con Debe ≠ Haber antes de cerrar.
- **Una factura quedó "pendiente".** Hacienda aún no respondió; usa *Consultar estado* más tarde.
- **Me aparece el panel de planes.** Esa función es del plan Pro (mes de prueba gratis, o suscripción por PayPal/tarjeta; también SINPE Móvil activado manualmente).
- **¿Cómo recupero mis datos en otro teléfono?** Iniciando sesión (nube) o con el respaldo `.json` (*Archivo → Versiones y backups → Restaurar desde archivo*).
- **¿Cómo elimino mi cuenta?** *Mi perfil → Eliminar mi cuenta*: pide tu contraseña y que escribas ELIMINAR. Es definitivo.
- **Atajos de teclado:** `Ctrl+S` guardar, `Ctrl+Z/Y` deshacer/rehacer, `Ctrl+F` buscar, `Ctrl+B/I` negrita/cursiva, `Enter/Tab` moverte, `Ctrl+flechas` saltar al borde de los datos.

---

# Para desarrollo

## Arquitectura

```
App móvil (Expo / React Native)
 └─ WebView  →  assets/hoja-matriz-contable.html   (la hoja de cálculo)

Vercel (carpeta api/)  →  firma y envía a Hacienda, Sibö, PayPal, avisos
Cloudflare Worker "matriz-certificados"  →  certificados cifrados, numeración,
                                            historial, notificaciones (KV)
Firebase  →  autenticación y datos de usuario
GitHub Actions  →  build de la app (EAS) y revisión de facturas pendientes
```

> La hoja de cálculo vive como un **archivo aparte** (`assets/hoja-matriz-contable.html`) y no dentro de un `.js`: pegada como texto, Metro la corrompía al compilar. Ver `metro.config.js`.

### Estructura del repositorio

```
App.js                         Punto de entrada
app.json · eas.json            Configuración de Expo y de los builds
metro.config.js                Trata .html como archivo empaquetado
assets/                        Íconos y la hoja (hoja-matriz-contable.html)
docs/                          Guía de uso en PDF
src/screens/                   Login, Home, Sibö, Certificado, Funciones, Perfil
src/components/SheetEditor.js  Carga la hoja en el WebView y puente nativo
src/services/                  Firebase, motor de fórmulas, módulos, bloqueo, borrado de cuenta
api/                           Funciones de Vercel (servidor)
.github/workflows/             eas-build.yml · revisar-pendientes.yml
```

### Rutas del servidor (`api/`)

| Archivo | Función |
| --- | --- |
| `firmar-factura.js` | Firma y envía facturas/tiquetes |
| `emitir-nota-credito.js` · `emitir-nota-debito.js` | Notas de crédito y débito |
| `emitir-recibo-pago.js` · `emitir-mensaje-receptor.js` | Recibos y mensaje del receptor |
| `consultar-estado.js` | Consulta el estado de un comprobante |
| `revisar-pendientes.js` | Revisa facturas pendientes (lo llama GitHub Actions) |
| `enviar-correo-factura.js` · `enviar-aviso.js` · `notificar-cambio.js` | Correos y avisos |
| `sibo-chat.js` | Chat de Sibö (Claude) |
| `paypal-config.js` · `paypal-suscripcion.js` · `paypal-webhook.js` | Suscripción Pro |
| `webproxy.js` | Proxy de peticiones web |

## Desarrollo local

Requiere Node 22.

```bash
npm install
npx expo start          # abre en Expo Go o en un emulador
```

Los builds de Android (APK) con EAS se disparan al hacer commit a `main` (workflow *EAS Build*).

## Variables de entorno

**Vercel** (Project → Settings → Environment Variables):

| Variable | Para qué |
| --- | --- |
| `CERTIFICADOS_WORKER_URL` | Dirección del Worker de certificados |
| `FIRMA_SERVICE_SECRET` | Llave compartida entre Vercel y el Worker |
| `FIREBASE_API_KEY` | Verificar sesiones de Firebase |
| `ANTHROPIC_API_KEY` | Sibö |
| `CRON_SECRET` | Autoriza la revisión de pendientes |
| Variables de PayPal | Suscripción Pro |

**Cloudflare Worker `matriz-certificados`:** `ENCRYPTION_KEY` (32 caracteres), `FIRMA_SERVICE_SECRET`, `FIREBASE_API_KEY` y el KV `CERTIFICADOS_KV` (namespace `certificados_clientes`).

**GitHub (Actions → Secrets):** `CRON_SECRET`, con el mismo valor que en Vercel.

> No guardes ninguna de estas llaves en el repositorio.

---

## Licencia

© 2026 KCN Studio (Keny Chinchilla Navarro). **Todos los derechos reservados.** Prohibido copiar, modificar, redistribuir o hacer ingeniería inversa sin autorización escrita. Detalles en [LICENSE](./LICENSE).

Contacto: <https://kenychinchilla.com>
