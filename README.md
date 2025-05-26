# ONI Vault

**ONI Vault** es un sistema de gestión de archivos con soporte para carpetas, imágenes, videos, etiquetas, filtros, autenticación y más.

## 🧰 Tecnologías utilizadas

- **Frontend:** React + Vite + Axios + React Router
- **Backend:** Node.js + Express + PostgreSQL + Multer
- **Autenticación:** JWT (Login & Registro)
- **Estilos:** Bootstrap + diseño personalizado oscuro
- **Almacenamiento:** Archivos se guardan en carpetas por usuario y carpeta en `/uploads`.

## 🚀 Funcionalidades principales

- Crear y eliminar carpetas
- Subir imágenes/videos individual o múltiples (drag & drop)
- Ver detalles de archivo y editar descripción, carpeta y etiquetas
- Filtrar por tipo y buscar por descripción o etiqueta
- Eliminar múltiples archivos con selección masiva
- Acceso protegido por login

---

## ⚙️ Cómo usar

### 1. Clonar el proyecto

```bash
git clone https://github.com/EXTRANFUNEDGAR/ONI-Vault.git
cd ONI-Vault
```

### 2. Configurar entorno

Crea un archivo `.env` en `backend/` con lo siguiente:

```env
PORT=5000
DB_USER=postgres
DB_PASSWORD=postgres
DB_HOST=localhost
DB_NAME=oni_vault
DB_PORT=5432
JWT_SECRET=clave_super_secreta
```

### 3. Instalar dependencias

#### Backend

```bash
cd backend
npm install
```

#### Frontend

```bash
cd ../frontend
npm install
```

### 4. Crear base de datos PostgreSQL

```sql
CREATE DATABASE oni_vault;
```

Ejecuta las sentencias SQL del archivo `db.sql` o `schema.sql` si lo tienes.

### 5. Ejecutar en desarrollo

#### Backend

```bash
cd backend
node index.js
```

#### Frontend

```bash
cd frontend
npm run dev
```

---

## 🐳 Uso con Docker (opcional)

### 1. Construir contenedores

```bash
docker-compose up --build
```

### 2. Servicios expuestos

- **Frontend:** http://localhost:5173
- **Backend/API:** http://localhost:5000
- **Base de datos PostgreSQL:** puerto 5432

### 3. Variables de entorno

Asegúrate de que `.env` esté en `backend/` y configurado correctamente antes de ejecutar `docker-compose`.

---

## 📁 Estructura del proyecto

```
ONI-Vault/
├── backend/
│   ├── routes/
│   ├── models/
│   ├── middleware/
│   ├── uploads/
│   └── index.js
├── frontend/
│   ├── src/pages/
│   ├── src/components/
│   └── main.jsx
└── README.md
```

---

## ✍️ Autor

Edgar Enrique Delgado Sánchez

---

## 🛡️ Licencia

MIT
