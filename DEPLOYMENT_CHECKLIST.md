# Checklist: Deploy a Producción

> **Versión**: 1.0  
> **Fecha**: 15 de noviembre de 2025  
> **Estado**: 🟡 Listo para revisar

---

## Pre-Deploy: Validación Local

- [ ] **Tests unitarios pasan**

  ```bash
  npx ts-node scripts/test-progress-advancement.ts
  ```

  Esperado: ✅ Todos los tests pasaron exitosamente!

- [ ] **Sin errores de compilación**

  ```bash
  npm run build
  # o
  npx expo build:web
  ```

- [ ] **Linter limpio**

  ```bash
  npm run lint
  # o
  npx eslint .
  ```

- [ ] **Testing manual en desarrollo**
  - [ ] Generar rutina en onboarding
  - [ ] Iniciar un entrenamiento
  - [ ] Completar y "Guardar y Salir"
  - [ ] Verificar que el Home muestra el SIGUIENTE día
  - [ ] Verificar que próximos 6 días se muestran correctamente

---

## Database: Migración Supabase

- [ ] **Tabla `user_progress` creada**
  - [ ] Abrir Supabase Dashboard
  - [ ] Ir a SQL Editor
  - [ ] Copiar y ejecutar: `supabase/migrations/001_create_user_progress_table.sql`
  - [ ] Verificar que la tabla aparece en "Tables"
- [ ] **RLS habilitado**

  - [ ] En Supabase > Authentication > Policies
  - [ ] Confirmar 3 policies (SELECT, UPDATE, INSERT)

- [ ] **Permisos correctos**
  ```sql
  -- En SQL Editor, verificar:
  SELECT * FROM user_progress LIMIT 1;
  -- Debe retornar 0 filas (tabla vacía)
  ```

---

## Configuración de Producción

- [ ] **Variables de entorno**

  - [ ] `SUPABASE_URL` correcto en `.env.production`
  - [ ] `SUPABASE_ANON_KEY` correcto en `.env.production`
  - [ ] Verificar que conecta al proyecto de producción (no test/dev)

- [ ] **Rollback plan**
  - [ ] Backup de base de datos completado ✅
  - [ ] Script de reversión lista (en caso de issues)

---

## Deploy: Frontend

### Option A: Expo (Recomendado para MVP)

```bash
# Desde rama 'test' (o 'main')
npm run build:mobile

# O si usas EAS (Expo Application Services):
eas build --platform ios --profile production
eas build --platform android --profile production
```

### Option B: Web (Si aplica)

```bash
npm run build:web
# Luego subir dist/ a hosting (Vercel, Firebase, etc.)
```

---

## Post-Deploy: Validación en Producción

- [ ] **Conectar a producción**

  - [ ] Cambiar URLs en constantes a producción
  - [ ] Verificar que conecta a Supabase production

- [ ] **Testing end-to-end en producción**

  - [ ] Crear usuario nuevo en producción
  - [ ] Completar onboarding
  - [ ] Guardar un entrenamiento
  - [ ] Verificar que progreso se persiste
  - [ ] Verificar que el progreso aparece en la tabla `user_progress`

- [ ] **Monitoring**
  - [ ] Supabase > Logs: Sin errores críticos
  - [ ] Analytics (si tienes): Usuarios activos, eventos
  - [ ] Alertas configuradas para errores DB

---

## Rollback (si es necesario)

Si algo falla en producción:

1. **Revertir cambios de código**

   ```bash
   git revert <commit>
   git push origin main
   # Re-build y re-deploy
   ```

2. **Revertir tabla (si es necesario)**

   ```sql
   DROP TABLE user_progress CASCADE;
   -- La app seguirá funcionando (usa AsyncStorage como fallback)
   ```

3. **Restaurar base de datos desde backup**
   - Supabase > Backups > Restore

---

## Monitoreo Post-Deploy (Semana 1)

- [ ] **Errores en Supabase**

  - [ ] Revisar Logs diariamente
  - [ ] Buscar "Error" o "null" en user_progress queries

- [ ] **Performance**

  - [ ] ¿Los queries a user_progress son rápidos?
  - [ ] ¿Se ralentiza el Home al cargar progreso?

- [ ] **User feedback**

  - [ ] ¿Reportan que el día no avanza?
  - [ ] ¿Reportan que se pierde progreso?

- [ ] **Datos integridad**
  - [ ] ¿week_index/day_index tienen valores válidos?
  - [ ] ¿last_completed es correcta?

---

## Notas

- **Compatibilidad hacia atrás**: La app sigue funcionando sin tabla `user_progress` (usa AsyncStorage como fallback)
- **Migration safe**: Si migración falla, app no se rompe
- **User experience**: Los usuarios verán el progreso actualizado en siguiente apertura de app

---

**Responsable**: [Tu nombre]  
**Fecha de deploy**: **\_\_**  
**Versión**: v1.0  
**Estado final**: [ ] ✅ Deploy completado
