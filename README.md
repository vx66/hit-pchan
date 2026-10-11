<p align="center">
  <img src="sprites/pchan/fase_01/fase01_ouch.png" alt="P-Chan después de un golpe" width="240" />
</p>

<h1 align="center">Hit P-Chan!</h1>

<p align="center">Un pequeño juego pixel art con una estética kawaii rosa y un final inquietante.</p>
<p align="center">Creado por <a href="https://x.com/xergno">Xergno</a>.</p>

## El juego

Escribe tu nombre y comienza a jugar. Cada clic o toque sobre la parte visible de P-Chan cuenta como un golpe. El fondo y los márgenes transparentes no cuentan.

- Diseño adaptable a móviles, tablets y escritorio, en vertical y horizontal.
- Cursor con mano, martillo y cuchillo; en pantallas táctiles, el arma aparece brevemente sobre el toque.
- Sprites de impacto sincronizados, partículas y animaciones suaves.
- Quince frases personalizadas con tu nombre, en burbujas redondeadas que flotan. Aparecen cada 50 golpes y duran 15 segundos; después de la última frase, el ciclo vuelve a empezar.
- Español, inglés y japonés, con fuentes incluidas localmente.
- Diálogos de desbloqueo que detienen los golpes hasta pulsar «Continuar».
- Pantalla final con texto progresivo y opción de jugar nuevamente.
- Controles de teclado, gestión del foco y respeto a la preferencia de movimiento reducido.

### Progresión

El arma y el sprite de P-Chan cambian por separado:

| Golpes acumulados | Arma | Sprite de P-Chan | Evento |
| --- | --- | --- | --- |
| 0–499 | Mano | Fase 01 | — |
| 500–549 | Martillo | Fase 01 | Desbloqueo del martillo en 500 |
| 550–999 | Martillo | Fase 02 | Cambio de personaje en 550 |
| 1000–1049 | Cuchillo | Fase 02 | Desbloqueo del cuchillo en 1000 |
| 1050–1499 | Cuchillo | Fase 03 | Cambio de personaje en 1050 |
| 1500 | — | Pantalla final | Fase 04 |

### Datos guardados

El nombre y el idioma se guardan en `localStorage`. Las partidas incompletas se reinician al recargar: no se conserva el contador ni los desbloqueos. Si llegas al final, ese estado sí se guarda y reaparece al recargar.

«Jugar nuevamente» borra el final y reinicia la partida, conservando tu nombre y el idioma. No hay backend, cuentas, base de datos ni servicios externos. Los datos se mantienen en el navegador de cada persona y son independientes para cada dominio.

## Ejecutar en tu equipo

Requiere Node.js 24 y npm. También son compatibles Node.js 22.12 o posterior de la rama 22 y Node.js 26.

```bash
npm ci
npm run dev
```

Abre la dirección que indique Vite, normalmente `http://127.0.0.1:5173`.

Para probarlo desde un móvil o tablet en la misma red Wi-Fi:

```bash
npm run dev:network
```

Abre en el dispositivo la dirección `Network` que imprima Vite.

### Comprobaciones y versión de producción

```bash
npm run typecheck
npm test
npm run build
npm run preview
```

La compilación se genera en `dist/`. `preview` sirve para revisar esa compilación en tu equipo; en el VPS, Nginx sirve los archivos estáticos.

Las pruebas de navegador requieren instalar los navegadores de Playwright:

```bash
npx playwright install chromium firefox
npm run test:browser
```

En Linux, Playwright puede indicar que faltan bibliotecas del sistema. Las pruebas cubren ratón, interacción táctil, umbrales, diálogos, recarga, final, ciclo de frases y diseño sin superposiciones en móviles, tablets y escritorio. Son pruebas con dispositivos simulados.

## Desplegar con Dokploy

El repositorio incluye un `Dockerfile` de dos etapas: Node.js instala las dependencias con el archivo de bloqueo, ejecuta las pruebas unitarias y compila; Nginx sirve únicamente el resultado de `dist/` en el puerto **80**. El contenedor incluye una comprobación de salud en `/healthz`.

No necesitas variables de entorno, volúmenes ni una base de datos.

1. Sube los archivos a tu repositorio `vx66/hit-pchan` siguiendo los comandos de la siguiente sección.
2. En Dokploy, crea un proyecto y una aplicación.
3. Conecta GitHub y selecciona el repositorio `vx66/hit-pchan`, rama `main`. Si es privado, concede acceso a ese repositorio al proveedor de GitHub de Dokploy.
4. Configura el tipo de construcción como **Dockerfile**:

   | Campo | Valor |
   | --- | --- |
   | Dockerfile Path | `Dockerfile` |
   | Docker Context Path | `.` |
   | Docker Build Stage | `production` |

5. En **Domains**, agrega el dominio que usarás, ruta `/` y puerto del contenedor **80**. Para un dominio propio, apunta su DNS al VPS y configura HTTPS desde Dokploy.
6. Pulsa **Deploy** y comprueba que la construcción y el contenedor estén correctos.
7. Abre tu dominio. La dirección `https://TU_DOMINIO/healthz` debe devolver `ok`.

Los nombres de los campos pueden variar ligeramente según la versión de Dokploy. Consulta su [documentación de Dockerfile](https://docs.dokploy.com/docs/core/applications/build-type#dockerfile) y de [dominios](https://docs.dokploy.com/docs/core/domains).

La aplicación está preparada para publicarse en la raíz del dominio. El puerto 80 es el puerto interno del contenedor; Dokploy gestiona el acceso público y HTTPS.

### Comprobar la imagen Docker en tu equipo

Si tienes Docker instalado:

```bash
docker build -t hit-pchan:local .
docker run --rm --name hit-pchan-local -p 127.0.0.1:8080:80 hit-pchan:local
```

Abre `http://127.0.0.1:8080`. En otra terminal puedes comprobar su salud:

```bash
curl --fail http://127.0.0.1:8080/healthz
```

Detén el contenedor con `Ctrl+C` en la terminal donde lo ejecutaste.

## Subir a GitHub

Para un repositorio remoto vacío y una carpeta local que todavía no está inicializada con Git:

```bash
cd ~/Projects/PChanClicker
git init -b main
git add .
git commit -m "Preparar Hit P-Chan para Dokploy"
git remote add origin https://github.com/vx66/hit-pchan.git
git push -u origin main
```

Si Git te solicita nombre y correo, configura tu identidad antes de repetir el commit. Si ya inicializaste Git o configuraste `origin`, conserva esa configuración y omite los pasos que ya hiciste. Si el repositorio remoto contiene archivos, integra primero sus cambios; no es necesario forzar la subida.

Para futuras actualizaciones:

```bash
git add .
git commit -m "Actualizar Hit P-Chan"
git push
```

Después, ejecuta **Deploy** en Dokploy. También puedes configurar el despliegue automático desde su integración con GitHub.

## Estructura

```text
├── Dockerfile                 # Construcción y servidor de producción
├── .dockerignore              # Exclusiones para la imagen
├── deploy/nginx.conf          # Recursos estáticos, caché y salud
├── public/                    # Favicon y sprites que sirve la aplicación
├── sprites/                   # PNG originales, sin modificaciones
├── src/
│   ├── components/            # Pantallas, cursor, diálogos y burbujas
│   ├── game/                  # Lógica, umbrales y almacenamiento
│   ├── i18n/                  # Textos y frases en los tres idiomas
│   └── styles/                # Estética pixel art y diseño adaptable
├── tests/                     # Pruebas unitarias y de navegador
└── package-lock.json          # Dependencias fijadas para npm ci
```

La carpeta `curors` conserva su nombre original. Los archivos de `public/sprites/` son copias idénticas de los originales; las pruebas comprueban que no se hayan alterado.

`node_modules/`, `dist/`, los resultados de pruebas, las variables de entorno y las carpetas locales de herramientas quedan excluidos de Git y del contexto Docker cuando corresponde.
