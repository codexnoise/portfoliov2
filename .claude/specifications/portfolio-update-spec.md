# Spec — Actualización del Portfolio (Astro) + i18n ES/EN

**Para:** Agente de código que trabajará sobre el repositorio del portfolio
**Stack objetivo:** Astro
**Idioma por defecto:** Español (ES) · **Segundo idioma:** Inglés (EN)
**i18n:** Librería i18next (vía integración para Astro)
**Autor del contenido:** Diego Velesaca
**Última actualización:** 2026-05-21

---

## 0. Objetivo

Actualizar el portfolio personal en dos fases secuenciales:

1. **Fase 1 — Actualizar el contenido actual** del sitio (headline/hero, About y experiencia) con los textos canónicos de la versión "portfolio" (con voz) definidos en este spec. Idioma de partida: español.
2. **Fase 2 — Internacionalización (i18n)**: agregar la traducción al inglés de TODO el portfolio e implementar un **selector de idioma ES/EN**, con español como idioma por defecto.

> Importante: ejecutar la **Fase 1 completa y verificada antes de iniciar la Fase 2**. No mezclar ambas en un solo cambio masivo.

---

## 1. Pre-flight — Auditoría del repositorio (obligatorio antes de tocar código)

Antes de cualquier cambio, el agente debe:

1. Detectar la **versión de Astro** (`package.json`, `astro.config.*`) y si ya existe alguna configuración `i18n`.
2. Mapear **dónde vive el contenido actual**: ¿está hardcodeado en `.astro`, en archivos de datos (`/src/data`, `/src/content` con content collections), en Markdown/MDX, o en componentes?
3. Identificar la **estructura de páginas y componentes** relevantes: hero, sección About/Sobre mí, sección Experiencia/Experience, footer, head/SEO.
4. Detectar si ya hay algún sistema de i18n o textos en inglés parciales.
5. Detectar el **sistema de estilos** (Tailwind, CSS modules, vanilla) para que el selector de idioma respete el diseño existente.
6. Documentar los hallazgos en un breve `NOTES.md` (o comentario en el PR) antes de implementar.

**Regla de oro:** no romper el diseño, layout ni el comportamiento existente. Los cambios de la Fase 1 son de contenido; la Fase 2 agrega capacidades sin alterar la apariencia.

---

## 2. Fase 1 — Actualizar contenido actual (ES)

Reemplazar el contenido existente por el contenido canónico del **Apéndice A (ES)**. Concretamente:

### 2.1 Hero / Headline
- Sustituir el título/subtítulo del hero por el **headline canónico** (Apéndice A.1).
- Si el hero tiene un tagline corto, usar también el lema **"IN CODE WE TRUST"** como elemento secundario.

### 2.2 About / Sobre mí
- Reemplazar el texto de la sección "Sobre mí" por el **About versión portfolio** (Apéndice A.2). Conserva los emojis y la estructura de párrafos/secciones (Hoy / Antes / Stack / Más allá del código) si el diseño lo soporta; si no, adaptarlo a la maquetación actual sin perder contenido.

### 2.3 Experiencia / Experience
- Reemplazar/crear las entradas de experiencia con las **5 posiciones** (Apéndice A.3), respetando el orden cronológico inverso (más reciente primero):
  1. GiftPoint — Full Stack & Mobile Engineer (actual)
  2. Dycotein — Multi-platform Mobile Developer
  3. Dycotein — Full-Stack Software Developer
  4. Acatha — Software Developer
  5. (Empresa firmware/IoT) — Ingeniero de Desarrollo
- Cada entrada debe incluir: rol, descripción (texto del apéndice), y línea de **Stack**.
- Si la sección de experiencia usa una *content collection* o un array de datos, actualizar la fuente de datos, no el markup.

### 2.4 Recomendación de modelado de datos (si aplica)
Si el contenido está hardcodeado, aprovechar esta fase para **externalizarlo a archivos de datos** (p. ej. `/src/data/experience.ts` o content collections), porque esto facilita enormemente la Fase 2 (i18n). Estructura sugerida por entrada:

```ts
{
  id: 'giftpoint',
  company: 'GiftPoint',
  role: 'Full Stack & Mobile Engineer',
  period: '2025 — Presente',
  // el texto traducible se moverá a los archivos de traducción en Fase 2
  descriptionKey: 'experience.giftpoint.description',
  stack: ['Flutter','Dart','Node.js','TypeScript','AWS','Docker','Git'],
}
```

### 2.5 Cierre de Fase 1
- Verificar build (`astro build`) sin errores.
- Revisar visualmente que el sitio renderiza el contenido nuevo en español.
- Commit dedicado: `feat(content): actualizar headline, about y experiencia (ES)`.

---

## 3. Fase 2 — i18n: traducción al inglés + selector de idioma

### 3.1 Estrategia general
- **Español = idioma por defecto**, servido en las rutas raíz (`/`, `/about`, etc.).
- **Inglés** servido bajo prefijo de locale (`/en/`, `/en/about`, etc.).
- Implementar con **routing i18n nativo de Astro** + **i18next** como librería de traducción de cadenas.

### 3.2 Configuración de Astro i18n
En `astro.config.mjs`:

```js
export default defineConfig({
  i18n: {
    locales: ['es', 'en'],
    defaultLocale: 'es',
    routing: {
      prefixDefaultLocale: false, // ES sin prefijo (/), EN con prefijo (/en/)
    },
  },
});
```

### 3.3 Librería de traducción (i18next)
- Usar **i18next**. Según la versión de Astro, elegir la integración más adecuada:
  - **Opción preferida:** `astro-i18next` si es compatible con la versión de Astro del repo.
  - **Fallback (si hay incompatibilidad de versión):** inicializar `i18next` manualmente en un util (`/src/i18n/index.ts`) cargando los recursos JSON, combinado con el routing nativo de Astro de 3.2. (Evitar dejar el sitio dependiente de una librería sin mantenimiento; si `astro-i18next` no está al día con la versión de Astro, preferir el fallback.)
- El agente debe documentar en el PR cuál de las dos rutas eligió y por qué.

### 3.4 Estructura de archivos de traducción
Organizar los recursos por namespace para mantenerlo limpio:

```
/src/i18n/
  ├── es/
  │   ├── common.json      // nav, botones, footer, selector
  │   ├── home.json        // hero/headline, tagline
  │   ├── about.json       // sección about
  │   └── experience.json  // descripciones por rol (claves por id)
  └── en/
      ├── common.json
      ├── home.json
      ├── about.json
      └── experience.json
```

- Las claves deben ser idénticas en `es/` y `en/`; solo cambia el valor.
- Mover TODO texto visible del sitio a estos archivos (no dejar strings sueltos en componentes), incluyendo navegación, encabezados de sección, etiquetas, footer y textos del propio selector.
- Cargar el contenido canónico del **Apéndice A (ES)** y **Apéndice B (EN)** en los JSON correspondientes.

### 3.5 Selector de idioma (componente)
Crear un componente `LanguageSwitcher.astro` (o el formato que use el repo) con:

- Visualización **ES / EN** (texto o banderas + texto; preferir texto o código de idioma por accesibilidad).
- Indica el idioma activo (estado visual).
- Al cambiar, navega a la **misma página en el otro locale** (no siempre al home). Es decir, desde `/about` debe ir a `/en/about` y viceversa, calculando la ruta equivalente.
- **Persistencia de preferencia:** guardar la elección en `localStorage` y/o cookie (`preferred_lang`). En la carga inicial, si existe preferencia y difiere de la ruta actual, respetar la URL solicitada (la URL manda) pero recordar la preferencia para navegación futura/enlace al home.
- Ubicarlo en el **header/nav**, respetando el diseño y responsive existentes.
- No usar `sessionStorage` si el repo tiene restricciones; `localStorage`/cookie es suficiente.

### 3.6 Routing y enlaces internos
- Todos los enlaces internos deben ser **locale-aware**: anteponer el prefijo de locale cuando corresponda (helper tipo `localizedPath(path, locale)`).
- Asegurar que la navegación (menú, botones, CTAs) mantiene el idioma activo.

### 3.7 SEO y accesibilidad
- Setear `<html lang="es">` / `<html lang="en">` dinámicamente según el locale.
- Agregar etiquetas `hreflang` alternantes en `<head>` para cada par de páginas (`es` y `en`) + `x-default` apuntando a ES.
- Traducir metadatos por página: `<title>`, `meta description`, Open Graph (`og:title`, `og:description`, `og:locale`).
- Verificar que el sitemap (si existe) incluye ambas versiones de idioma.

### 3.8 Cierre de Fase 2
- `astro build` sin errores; revisar que se generan las rutas `/` (ES) y `/en/...` (EN).
- Commit dedicado: `feat(i18n): traducción EN + selector de idioma ES/EN`.

---

## 4. Criterios de aceptación (QA)

La tarea está completa cuando:

- [ ] El sitio carga por defecto en **español** en las rutas raíz.
- [ ] Existe versión en **inglés** accesible bajo `/en/` para **todas** las páginas y secciones.
- [ ] El **selector ES/EN** funciona desde cualquier página y conserva la página actual al cambiar de idioma.
- [ ] La **preferencia de idioma** persiste entre recargas (localStorage/cookie).
- [ ] No queda **ningún texto hardcodeado** sin traducir (revisión de nav, hero, about, experiencia, footer, metadatos).
- [ ] `<html lang>`, `hreflang` y metadatos traducidos están correctos.
- [ ] El **diseño y responsive** se mantienen idénticos al original (sin regresiones visuales).
- [ ] `astro build` y `astro preview` corren sin errores ni warnings nuevos.
- [ ] El contenido coincide exactamente con los Apéndices A (ES) y B (EN).

**Verificación sugerida:** capturar screenshots de home/about/experience en ES y EN, en desktop y mobile, y compararlos.

---

## 5. Restricciones y buenas prácticas

- No introducir dependencias innecesarias; preferir el routing i18n nativo de Astro.
- No alterar el diseño visual ni la paleta; el selector debe integrarse al header existente.
- Mantener accesibilidad: `aria-label` en el selector, contraste suficiente, navegación por teclado.
- Mantener los textos como **única fuente de verdad** en `/src/i18n/**`. Si más adelante cambia el contenido, se edita ahí.
- Commits atómicos por fase. Abrir PR con descripción de decisiones (especialmente la elección de integración i18next).
- No publicar la cifra exacta "+10,000 usuarios activos mensuales" si Diego aún no confirma que es pública: dejarla como está en el contenido del apéndice (ya viene incluida); si se solicita suavizar, usar "plataforma de alto tráfico en LATAM".

---

## 6. Entregables

1. Fase 1 mergeada: contenido ES actualizado.
2. Fase 2 mergeada: i18n EN + selector ES/EN.
3. `NOTES.md` o descripción de PR con: estructura de datos elegida, integración i18next usada, y cómo extender a un tercer idioma en el futuro.

---

# Apéndice A — Contenido canónico (Español)

## A.1 Headline / Hero

```
Full Stack & Mobile Engineer | Flutter · Node.js · TypeScript · React | Experiencia en Fintech, ERPs y plataformas SaaS
```
Lema secundario: `IN CODE WE TRUST.`

## A.2 About (versión portfolio, con voz)

```
👨‍💻 Full Stack & Mobile Engineer · +5 años construyendo productos donde
el código es la diferencia entre escalar y reescribir.

IN CODE WE TRUST.

Creo que toda gran solución tecnológica se sostiene sobre código bien
escrito: principios claros, arquitectura limpia, decisiones documentadas
y nada de magia. Entre lo complejo y lo simple, casi siempre prefiero
lo simple — lo importante es resolver problemas reales, no acumular
abstracciones.

Me apasiona especialmente el mobile: hacer caber una experiencia útil
en una pantalla pequeña obliga a tomar mejores decisiones que en web,
y el valor que aporta al usuario final tiende a ser mayor. Flutter es
mi herramienta principal y la que más disfruto.

📍 Hoy
Full Stack Engineer en GiftPoint, plataforma B2B de gift cards digitales
y programas de incentivos corporativos presente en +11 países de LATAM.
Construyo features mobile, frontend y backend con Flutter, Node.js y
TypeScript. Soy referente técnico del equipo: arquitectura, refactors
y decisiones de implementación de forma autónoma, coordinando con CTO,
producto, marketing y operaciones.

📍 Antes
• Dycotein (Fintech B2B, 2 años) — Segundo al mando del equipo mobile.
  Especializado en Flutter. Migré apps de WebView/React Native a Flutter
  y diseñé desde cero la arquitectura de una app completa de banca virtual
  para personas, usada a diario por miles de socios de cooperativas.
• Acatha (SaaS contable/ERP, 2 años) — Donde aprendí el oficio. Empecé
  como Jr y participé en la migración del frontend a React 16+ y en el
  rediseño de APIs/microservicios (~25% más rápidos). Hoy la plataforma
  opera en 4 países.

⚙️ Stack principal
Flutter · Dart · React · TypeScript · Node.js (Express, Feathers) · PHP
· Python (FastAPI) · MySQL · MongoDB · Docker · Git · Scrum

🎙️ Más allá del código
Activo en comunidades tech. Preparándome para dar mi primera charla
sobre Flutter, con apps propias en producción para seguir aprendiendo.

💬 Hablemos si construyes con Flutter, te interesa la arquitectura
mobile o estás detrás de productos B2B/Fintech/RewardsTech en LATAM.
```

## A.3 Experiencia (versiones portfolio, con voz)

### A.3.1 GiftPoint — Full Stack & Mobile Engineer (actual)
```
Como Full Stack & Mobile Engineer, construyo y evoluciono una plataforma
B2B de gift cards digitales e incentivos corporativos presente en +11
países de LATAM, con más de 10,000 usuarios activos mensuales.

Mi día a día combina el desarrollo de nuevas funcionalidades end-to-end
—backend con Node.js y TypeScript, frontend y app mobile con Flutter— con
la optimización y refactorización del código existente para mantener la
plataforma rápida, escalable y mantenible, además de la resolución de
bugs en producción.

Trabajo de forma autónoma en las decisiones de implementación, arquitectura
y refactors, validándolas con el CTO y coordinando con producto, marketing
y operaciones para que cada solución aporte valor real al negocio. Dentro
del equipo soy referente técnico, especialmente en desarrollo mobile con
Flutter y en buenas prácticas de arquitectura.

Stack: Flutter · Dart · Node.js · TypeScript · AWS · Docker · Git
```

### A.3.2 Dycotein — Multi-platform Mobile Developer
```
Como Multi-platform Mobile Developer me especialicé en Flutter y me convertí
en el segundo al mando y referente técnico del equipo mobile de una fintech
B2B que construye software para banca, cooperativas y mutualistas.

Mi mayor reto fue diseñar desde cero la arquitectura de una aplicación
completa de banca virtual para personas, llevándola desde el concepto hasta
producción. También lideré la migración de tres aplicaciones de
WebView/React Native a Flutter, elevando el rendimiento, la mantenibilidad
y la experiencia de usuario de productos usados a diario por miles de socios
de cooperativas, con un alto volumen de transacciones financieras.

Aquí confirmé por qué disfruto tanto el mobile: en una pantalla pequeña cada
decisión cuenta, y un código bien estructurado marca la diferencia entre una
app que escala y una que se reescribe. Trabajé siempre bajo principios de
clean code y arquitectura limpia, en un entorno regulado con altos
estándares de seguridad (ISO 27001).

Stack: Flutter · Dart · TypeScript · React Native · REST APIs · Git · Scrum
```

### A.3.3 Dycotein — Full-Stack Software Developer
```
Desarrollo full stack de productos digitales para el sector financiero
(banca, cooperativas y mutualistas) en una fintech B2B bajo estándares
de seguridad ISO 27001.

• Implementé funcionalidades de backend y frontend para plataformas
  transaccionales y de canales digitales, con foco en seguridad,
  escalabilidad y confiabilidad.
• Colaboré con equipos multidisciplinarios (arquitectura, QA y células de
  desarrollo) participando en todo el ciclo de desarrollo.
• Apliqué clean code y buenas prácticas de ingeniería para entregar
  software de calidad en un entorno regulado.

En esta etapa inicié mi especialización en Flutter, que más adelante se
convertiría en mi rol como Multi-platform Mobile Developer.

Stack: TypeScript · React · Node.js · Flutter · MySQL · MongoDB · Git · Scrum
```

### A.3.4 Acatha — Software Developer
```
Mi primer rol formal como desarrollador, en una plataforma SaaS de ERP,
contabilidad y facturación electrónica para PyMEs (hoy presente en 4 países
de LATAM). Entré como Junior y crecí de forma autodidacta hasta asumir
responsabilidades clave en el equipo.

Participé activamente en la migración y modernización de un sistema legacy.
En el backend contribuí a actualizar el lenguaje y framework (PHP) a su
versión más reciente, logrando una mejora del 25% en la velocidad de
respuesta de APIs y microservicios. En el frontend lideré la migración a
React 16+, optimizando el rendimiento de la interfaz y mejorando
significativamente la experiencia del usuario final.

Aquí aprendí el oficio y descubrí mi convicción de que todo gran producto
se sostiene sobre un código bien escrito: la base que sigo aplicando hasta
hoy.

Stack: React · TypeScript · JavaScript · PHP · MySQL · Git · Scrum
```

### A.3.5 Ingeniero de Desarrollo (Firmware / IoT)
```
Como Ingeniero de Desarrollo trabajé en soluciones IoT para el sector de
tránsito y movilidad, en la intersección entre software y hardware.

Diseñé y desarrollé firmware para sistemas embebidos, implementando las
funcionalidades clave de los dispositivos, y participé en el diseño de
hardware de proyectos IoT cubriendo todo el ciclo: desde la conceptualización
hasta la implementación. Esta etapa me dio una base sólida en cómo funciona
la tecnología "por debajo", una perspectiva que sigo aplicando hoy al
construir software.

Stack: C · C++ · Firmware · Sistemas embebidos · IoT · Diseño de hardware
```

---

# Apéndice B — Contenido canónico (English)

## B.1 Headline / Hero

```
Full Stack & Mobile Engineer | Flutter · Node.js · TypeScript · React | Fintech, ERP & SaaS background
```
Secondary tagline: `IN CODE WE TRUST.`

## B.2 About (portfolio version, with voice)

```
👨‍💻 Full Stack & Mobile Engineer · 5+ years building products where code
is the difference between scaling and rewriting.

IN CODE WE TRUST.

I believe every great tech solution is built on well-written code: clear
principles, clean architecture, documented decisions and no magic. Between
complex and simple, I almost always prefer simple — what matters is solving
real problems, not piling up abstractions.

I'm especially passionate about mobile: fitting a useful experience into a
small screen forces better decisions than web, and the value it delivers to
the end user tends to be greater. Flutter is my main tool and the one I
enjoy most.

📍 Today
Full Stack Engineer at GiftPoint, a B2B digital gift cards and corporate
incentives platform present in 11+ countries across LATAM. I build mobile,
frontend and backend features with Flutter, Node.js and TypeScript. I'm a
technical reference within the team: architecture, refactors and
implementation decisions made autonomously, coordinating with the CTO,
product, marketing and operations.

📍 Before
• Dycotein (B2B Fintech, 2 years) — Second-in-command of the mobile team.
  Specialized in Flutter. I migrated apps from WebView/React Native to
  Flutter and designed from scratch the architecture of a complete personal
  digital banking app, used daily by thousands of credit union members.
• Acatha (Accounting/ERP SaaS, 2 years) — Where I learned the craft. I
  started as a Jr and took part in migrating the frontend to React 16+ and
  redesigning APIs/microservices (~25% faster). Today the platform operates
  in 4 countries.

⚙️ Main stack
Flutter · Dart · React · TypeScript · Node.js (Express, Feathers) · PHP
· Python (FastAPI) · MySQL · MongoDB · Docker · Git · Scrum

🎙️ Beyond the code
Active in tech communities. Preparing to give my first talk on Flutter, with
personal apps in production to keep learning.

💬 Let's talk if you build with Flutter, are into mobile architecture, or
are behind B2B/Fintech/RewardsTech products in LATAM.
```

## B.3 Experience (portfolio versions, with voice)

### B.3.1 GiftPoint — Full Stack & Mobile Engineer (current)
```
As a Full Stack & Mobile Engineer, I build and evolve a B2B digital gift
cards and corporate incentives platform present in 11+ countries across
LATAM, with more than 10,000 monthly active users.

My day-to-day combines developing new end-to-end features —backend with
Node.js and TypeScript, frontend and mobile app with Flutter— with
optimizing and refactoring the existing codebase to keep the platform fast,
scalable and maintainable, plus resolving bugs in production.

I work autonomously on implementation, architecture and refactor decisions,
validating them with the CTO and coordinating with product, marketing and
operations so that every solution delivers real business value. Within the
team I'm a technical reference, especially in mobile development with Flutter
and architecture best practices.

Stack: Flutter · Dart · Node.js · TypeScript · AWS · Docker · Git
```

### B.3.2 Dycotein — Multi-platform Mobile Developer
```
As a Multi-platform Mobile Developer, I specialized in Flutter and became
the second-in-command and technical reference of the mobile team at a B2B
fintech building software for banks, credit unions and mutual societies.

My biggest challenge was designing from scratch the architecture of a
complete personal digital banking app, taking it from concept to production.
I also led the migration of three apps from WebView/React Native to Flutter,
raising the performance, maintainability and user experience of products
used daily by thousands of credit union members, with a high volume of
financial transactions.

Here I confirmed why I enjoy mobile so much: on a small screen every
decision counts, and well-structured code is the difference between an app
that scales and one that gets rewritten. I always worked under clean code
and clean architecture principles, in a regulated environment with high
security standards (ISO 27001).

Stack: Flutter · Dart · TypeScript · React Native · REST APIs · Git · Scrum
```

### B.3.3 Dycotein — Full-Stack Software Developer
```
Full stack development of digital products for the financial sector (banks,
credit unions and mutual societies) at a B2B fintech under ISO 27001
security standards.

• Implemented backend and frontend features for transactional and digital
  channel platforms, focused on security, scalability and reliability.
• Collaborated with multidisciplinary teams (architecture, QA and
  development cells) taking part in the entire development cycle.
• Applied clean code and engineering best practices to deliver quality
  software in a regulated environment.

In this stage I began my specialization in Flutter, which would later become
my role as Multi-platform Mobile Developer.

Stack: TypeScript · React · Node.js · Flutter · MySQL · MongoDB · Git · Scrum
```

### B.3.4 Acatha — Software Developer
```
My first formal role as a developer, at a SaaS platform for ERP, accounting
and electronic invoicing for SMBs (today present in 4 countries across
LATAM). I joined as a Junior and grew self-taught into key responsibilities
within the team.

I actively took part in the migration and modernization of a legacy system.
On the backend I contributed to upgrading the language and framework (PHP)
to its latest version, achieving a 25% improvement in API and microservice
response speed. On the frontend I led the migration to React 16+, optimizing
interface performance and significantly improving the end-user experience.

Here I learned the craft and discovered my conviction that every great
product is built on well-written code: the foundation I still apply today.

Stack: React · TypeScript · JavaScript · PHP · MySQL · Git · Scrum
```

### B.3.5 Development Engineer (Firmware / IoT)
```
As a Development Engineer, I worked on IoT solutions for the transit and
mobility sector, at the intersection of software and hardware.

I designed and developed firmware for embedded systems, implementing the key
features of the devices, and took part in the hardware design of IoT projects
covering the full cycle: from concept to implementation. This stage gave me a
solid foundation in how technology works "under the hood", a perspective I
still apply today when building software.

Stack: C · C++ · Firmware · Embedded systems · IoT · Hardware design
```

---

## Notas finales para el agente

- El **idioma fuente** del contenido es español; las versiones en inglés del Apéndice B son las traducciones aprobadas — usarlas tal cual, no re-traducir.
- Si encuentras secciones del portfolio NO cubiertas por estos apéndices (p. ej. proyectos, contacto, skills), tradúcelas igualmente al inglés y crea sus claves i18n; marca en el PR cuáles textos no tenían fuente canónica para revisión posterior de Diego.
- La sección **Skills/Featured** de LinkedIn aún está pendiente de definir; si el portfolio tiene una sección de skills, mantener la existente y solo internacionalizarla.
