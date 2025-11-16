#!/bin/bash
# Script: Ejecutar migración en Supabase
# Uso: bash supabase/setup.sh
# 
# Este script lee la migración SQL y proporciona instrucciones
# para ejecutarla en Supabase Dashboard.

echo "🚀 Setup: Creando tabla user_progress en Supabase"
echo ""
echo "📝 PASOS A SEGUIR:"
echo ""
echo "1️⃣  Ve a https://supabase.com/dashboard/project/_/sql"
echo "    (Reemplaza '_' con tu Project ID)"
echo ""
echo "2️⃣  En la sección 'New Query', abre el archivo:"
echo "    📄 supabase/migrations/001_create_user_progress_table.sql"
echo ""
echo "3️⃣  Copia TODO el contenido del archivo"
echo ""
echo "4️⃣  Pega en el editor SQL de Supabase"
echo ""
echo "5️⃣  Presiona el botón verde 'RUN' (esquina superior derecha)"
echo ""
echo "6️⃣  Verifica que la tabla fue creada en:"
echo "    Editor → Tables → user_progress ✅"
echo ""
echo "---"
echo ""
echo "🎯 Para verificar que todo funcionó:"
echo ""
echo "SELECT * FROM user_progress LIMIT 5;"
echo ""
echo "Debería devolver 0 filas (tabla vacía = OK)"
echo ""
echo "---"
echo ""
echo "💾 Contenido del SQL a ejecutar:"
echo ""
cat supabase/migrations/001_create_user_progress_table.sql
echo ""
echo "---"
echo ""
echo "✨ ¡Listo! Ya puedes usar la tabla en tu app."
