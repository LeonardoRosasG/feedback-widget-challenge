# Feedback Widget Challenge

Sistema completo de recolección de feedback de usuarios, compuesto por un **SDK frontend** embebible y una **API backend** para almacenar y gestionar las respuestas.

## Descripción

Este proyecto permite integrar fácilmente un widget de feedback en cualquier aplicación web. Los usuarios pueden calificar su experiencia mediante un sistema de rating y enviar comentarios opcionales. El SDK se encarga de la interfaz visual y la comunicación con el servidor, mientras que el backend gestiona el almacenamiento y la validación de los datos.

### Características principales

- Widget embebible con temas claro/oscuro
- Sistema de rating (estrellas)
- Comentarios opcionales
- Autenticación mediante API Key
- Diseño responsive
- Persistencia con SQLite

---

## Tecnologías Utilizadas

### SDK (Frontend)
| Tecnología | Versión | Descripción |
|------------|---------|-------------|
| TypeScript | ^5.3.0 | Lenguaje de programación tipado |
| Rollup | ^4.9.0 | Bundler para generar UMD, ESM y CJS |
| Vitest | ^1.0.0 | Framework de testing |

### Server (Backend)
| Tecnología | Versión | Descripción |
|------------|---------|-------------|
| .NET | 10.0 | Framework de desarrollo |
| ASP.NET Core | 10.0 | Framework web para APIs |
| Entity Framework Core | 10.0.2 | ORM para acceso a datos |
| SQLite | - | Base de datos embebida |
| FluentValidation | 12.1.1 | Validación de requests |
| Swashbuckle | 10.1.1 | Documentación OpenAPI/Swagger |

---

## Comandos para Iniciar la Aplicación

### Requisitos previos

- **Node.js** >= 18.0.0
- **.NET SDK** 10.0

### SDK (Frontend)

```bash
# Navegar al directorio del SDK
cd sdk

# Instalar dependencias
npm install

# Compilar el SDK
npm run build

# Modo desarrollo (watch)
npm run dev

# Ejecutar tests
npm test
```

### Server (Backend)

```bash
# Navegar al directorio del servidor
cd server/server

# Restaurar dependencias
dotnet restore

# Ejecutar en modo desarrollo
dotnet run

# Compilar para producción
dotnet build -c Release

# Ejecutar tests
cd ../server.Tests
dotnet test
```

### Página de prueba

Abrir el archivo `test-page/test.html` en un navegador para probar el widget integrado.

---

## � Ejemplo de Uso del SDK

### Instalación vía CDN

```html
<script src="dist/feedback-widget.umd.min.js"></script>
```

### Inicialización básica

```html
<!DOCTYPE html>
<html>
<head>
  <title>Mi Aplicación</title>
</head>
<body>
  <h1>Bienvenido a mi app</h1>
  
  <!-- Cargar el SDK -->
  <script src="path/to/feedback-widget.umd.min.js"></script>
  
  <script>
    // Crear instancia del widget
    const widget = new FeedbackWidget({
      projectId: 'mi-proyecto-123',
      apiKey: 'tu-api-key-aqui',
      apiUrl: 'http://localhost:5000',
      theme: 'light',              // 'light' | 'dark'
      position: 'bottom-right',    // 'bottom-right' | 'bottom-left' | 'center'
      labels: {
        title: '¿Cómo fue tu experiencia?',
        placeholder: 'Cuéntanos más (opcional)...',
        submit: 'Enviar',
        cancel: 'Cancelar',
        success: '¡Gracias por tu feedback!'
      }
    });

    // Escuchar eventos
    widget.on('open', () => console.log('Widget abierto'));
    widget.on('close', () => console.log('Widget cerrado'));
    widget.on('submit', (data) => console.log('Feedback enviado:', data));
    widget.on('success', () => console.log('Envío exitoso'));
    widget.on('error', (err) => console.error('Error:', err));

    // Abrir el widget programáticamente
    widget.open();
  </script>
</body>
</html>
```

### Uso con ES Modules

```javascript
import { FeedbackWidget } from 'feedback-widget-sdk';

const widget = new FeedbackWidget({
  projectId: 'mi-proyecto-123',
  apiKey: 'tu-api-key-aqui',
  apiUrl: 'http://localhost:5000'
});

widget.open();
```

---

## Testear la API

### Usando Swagger UI

Una vez que el servidor esté corriendo, accede a la documentación interactiva:

```
http://localhost:5000/swagger
```

### Usando cURL

#### Enviar feedback (POST)

```bash
curl -X POST http://localhost:5000/api/feedback \
  -H "Content-Type: application/json" \
  -H "X-Api-Key: tu-api-key-aqui" \
  -d '{
    "projectId": "mi-proyecto-123",
    "userId": "usuario-456",
    "rating": 5,
    "comment": "¡Excelente experiencia!",
    "timestamp": "2026-02-04T12:00:00Z"
  }'
```

#### Obtener feedbacks por proyecto (GET)

```bash
curl -X GET http://localhost:5000/api/feedback/mi-proyecto-123 \
  -H "X-Api-Key: tu-api-key-aqui"
```

#### Health check (sin autenticación)

```bash
curl http://localhost:5000/health
```

### Usando Postman

1. **Crear nueva request** → `POST http://localhost:5000/api/feedback`

2. **Headers:**
   | Key | Value |
   |-----|-------|
   | Content-Type | application/json |
   | X-Api-Key | tu-api-key-aqui |

3. **Body (raw JSON):**
   ```json
   {
     "projectId": "mi-proyecto-123",
     "userId": "usuario-456",
     "rating": 5,
     "comment": "¡Excelente experiencia!",
     "timestamp": "2026-02-04T12:00:00Z"
   }
   ```

4. **Respuesta esperada (201 Created):**
   ```json
   {
     "success": true,
     "message": "Feedback submitted successfully",
     "feedbackId": "guid-generado"
   }
   ```

### Códigos de respuesta

| Código | Descripción |
|--------|-------------|
| 201 | Feedback creado exitosamente |
| 400 | Error de validación (rating inválido, campos faltantes) |
| 401 | API Key faltante o inválida |

---
## Configuración de Variables de Entorno (Backend)

### Archivo `appsettings.json`

Crea o modifica el archivo `server/server/appsettings.json` o el archivo `appsettings.Development.json` para desarrollo con la siguiente estructura:

```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  },
  "AllowedHosts": "*",
  "ConnectionStrings": {
    "DefaultConnection": "Data Source=feedback.db"
  },
  "ApiKeys": [
    "tu-api-key-segura-1",
    "tu-api-key-segura-2"
  ]
}
```

> **Importante:** En producción, asegúrate de usar API Keys seguras y únicas. Nunca subas credenciales al repositorio.

### URLs de la aplicación

Configuradas en `Properties/launchSettings.json`:

| Perfil | URL |
|--------|-----|
| HTTP | `http://localhost:5264` |
| HTTPS | `https://localhost:7033` |

---
## Estructura del Proyecto

```
├── sdk/                    # SDK Frontend (TypeScript)
│   └── src/
│       ├── FeedbackWidget.ts   # Clase principal del widget
│       ├── api.ts              # Cliente HTTP
│       ├── storage.ts          # Almacenamiento local
│       ├── styles.ts           # Estilos CSS-in-JS
│       └── types.ts            # Definiciones de tipos
│
├── server/                 # Backend API (.NET)
│   └── server/
│       ├── Api/                # Endpoints y middlewares
│       ├── Application/        # DTOs, servicios y validadores
│       ├── Domain/             # Entidades del dominio
│       └── Infrastructure/     # Persistencia y repositorios
│
└── test-page/              # Página HTML de prueba
```

---
