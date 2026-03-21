# Analizador Inteligente de Imagenes

Plataforma full-stack para subir una imagen, analizarla con IA y devolver etiquetas con su nivel de confianza.

## Arquitectura

El backend sigue **Arquitectura Hexagonal** para separar reglas de negocio de detalles externos:

- `domain`: entidades y contratos (puertos), sin dependencias de frameworks.
- `application`: casos de uso que orquestan el flujo del negocio.
- `infrastructure`: adaptadores (OpenAI), HTTP (Express), middlewares y wiring.

Esta estructura permite cambiar proveedores de IA o framework web sin romper el nucleo de negocio.

## Tecnologias

- Node.js
- TypeScript
- React
- Tailwind CSS
- Vitest
- Docker + Docker Compose

## Quick Start

1. Clonar el repositorio:

```bash
git clone <URL_DEL_REPO>
cd ia-image-analyzer
```

2. Configurar variables de entorno:

```bash
cp server/.env.example server/.env
```

Luego completa `API_KEY` en `server/.env`.

3. Levantar todo con Docker:

```bash
docker-compose up --build
```

Servicios disponibles:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:3000`

Para apagar el entorno:

```bash
docker-compose down
```

## Decisiones Tecnicas

- **Pre-flight check de runtime**: al iniciar el servidor se valida que Node.js sea `>= 18.0.0` para evitar fallos de compatibilidad en entornos locales inconsistentes.
- **Axios en el adaptador de IA**: se reemplazo `fetch` por `axios` para mejorar portabilidad, manejo de timeouts y consistencia en errores HTTP.
- **Factory para proveedor de IA**: el proveedor se resuelve por `AI_PROVIDER`, facilitando extension futura a otros vendors.
- **Nota sobre cuota de API**: Si recibe un error `429` en los logs, es debido a las limitaciones de cuota de la API Key proporcionada en el `.env`. El codigo maneja esto correctamente como `AI_PROVIDER_UNAVAILABLE`.

## Flujo de pruebas

- Unit tests backend:

```bash
npm run test --workspace=server
```

- Build backend:

```bash
npm run build --workspace=server
```
