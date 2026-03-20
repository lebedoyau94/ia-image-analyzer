#!/bin/bash
# 1. Crear directorios para Etapa 0 (Estructura Hexagonal) y Etapa 1 (Dominio)
echo "Creando estructura de directorios..."
mkdir -p server/src/{domain/entities,domain/ports,application,infrastructure}
mkdir -p client/src/{components,hooks,services}
# 2. Configurar archivos base (Etapa 0)
echo "Escribiendo .gitignore..."
cat << 'EOF' > .gitignore
node_modules
dist
.env
.DS_Store
*.local
EOF
echo "Escribiendo package.json raíz..."
cat << 'EOF' > package.json
{
  "name": "ia-image-analyzer",
  "version": "1.0.0",
  "private": true,
  "workspaces": [
    "client",
    "server"
  ],
  "scripts": {
    "dev:client": "npm run dev --workspace=client",
    "dev:server": "npm run dev --workspace=server",
    "dev": "npm run dev:client & npm run dev:server",
    "build": "npm run build --workspaces"
  }
}
EOF
echo "Escribiendo server/package.json..."
cat << 'EOF' > server/package.json
{
  "name": "server",
  "version": "1.0.0",
  "main": "dist/index.js",
  "scripts": {
    "build": "tsc",
    "dev": "ts-node-dev src/index.ts",
    "start": "node dist/index.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "multer": "^1.4.5-lts.1",
    "zod": "^3.22.4"
  },
  "devDependencies": {
    "@types/express": "^4.17.17",
    "@types/multer": "^1.4.7",
    "@types/node": "^20.0.0",
    "ts-node-dev": "^2.0.0",
    "typescript": "^5.0.0"
  }
}
EOF
echo "Escribiendo server/tsconfig.json..."
cat << 'EOF' > server/tsconfig.json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "CommonJS",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src/**/*"]
}
EOF
echo "Escribiendo client/tsconfig.json..."
cat << 'EOF' > client/tsconfig.json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"]
}
EOF
# 3. Código de Dominio (Etapa 1)
echo "Escribiendo código de Dominio..."
cat << 'EOF' > server/src/domain/entities/ImageTag.ts
export interface ImageTag {
  name: string;
  confidence: number;
}
EOF
cat << 'EOF' > server/src/domain/ports/IAIProvider.ts
import { ImageTag } from '../entities/ImageTag';
export interface IAIProvider {
  analyzeImage(imageBuffer: Buffer): Promise<ImageTag[]>;
}
EOF
# 4. Git Init y Commit
echo "Inicializando Git y creando commit inicial..."
git init
git add .
git commit -m "chore: initial project structure with npm workspaces and hexagonal architecture"
echo "¡Estructura generada exitosamente!"
