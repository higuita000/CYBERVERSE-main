# Migración a Supabase + Vercel — CYBERVERSE

## Qué se hizo en código (ya listo)
- `supabase/schema.sql` → esquema Postgres listo para pegar en Supabase SQL Editor
- `supabase/seed.sql` → catálogo, licencias, cupones, métodos de pago
- `api/*.js` → Vercel Functions que reemplazan los `.php` (login, register, process_payment, my_orders)
- `api/_supabase.js` → helper de conexión con SERVICE_ROLE
- `app.js` → `getApiUrl()` detecta entorno:
  - `localhost/cyber-game-store` → sigue usando `api/*.php` + MySQL local (XAMPP)
  - Vercel / otro hosting → usa `/api/*` (Functions JS + Supabase)
- `package.json` → dependencias `@supabase/supabase-js` + `bcryptjs` (Vercel hace npm install solo)

## Lo que debes hacer tú (5 pasos, ~15 min)

### 1. Crear proyecto Supabase
1. Entra a https://supabase.com → New project
2. Guarda: Project URL, `anon key` (no la necesitas aún) y `service_role key` (Settings → API)
3. Ve a SQL Editor → New query

### 2. Crear tablas
1. Pega TODO `supabase/schema.sql` → Run (debe decir Success)
2. Pega TODO `supabase/seed.sql` → Run
3. Verifica en Table Editor: `productos` debe tener 9 filas, `metodos_pago` 5 filas

### 3. Subir a GitHub + Vercel
```bash
git init
git add .
git commit -m "Migracion Supabase + Vercel Functions"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/cyberverse.git
git push -u origin main
```
En Vercel → Add New Project → importa el repo. Framework: Other. No cambies nada más.

### 4. Variables de entorno en Vercel (OBLIGATORIO)
Vercel → tu proyecto → Settings → Environment Variables → agrega:
- `SUPABASE_URL` = `https://xxxx.supabase.co`
- `SUPABASE_SERVICE_ROLE_KEY` = la clave service_role (la larga)
Marca los 3 ambientes (Production, Preview, Development) → Save → Redeploy.

### 5. Probar
1. Abre tu URL `https://tu-app.vercel.app`
2. Regístrate (crea usuario en tabla `usuarios` de Supabase)
3. Agrega al carrito → paga → verifica en Supabase: `ordenes`, `orden_detalles`, `transacciones_pago`
4. "Mis compras" debe mostrar la clave de activación

## Dudas comunes
- **¿Borro XAMPP / los .php?** No. Siguen funcionando en local. En Vercel se ignoran solos.
- **¿La service_role es segura?** Sí, solo vive en Vercel (servidor). Nunca la pongas en el frontend.
- **¿Contraseñas viejas de MySQL sirven?** Los hashes bcrypt de MySQL SÍ sirven si migras la tabla `usuarios` (bcrypt es portable). Si empiezas de cero, solo regístrate de nuevo.
- **Error "Faltan SUPABASE_URL..."** → olvidaste el paso 4 o no hiciste Redeploy.
