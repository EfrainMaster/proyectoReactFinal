# Efrain Store

## Cómo usar la página

1. Inicia la aplicación con `npm run dev` y abre la dirección local que muestra Vite.
2. En **Productos**, busca por nombre, categoría o descripción, selecciona una categoría y navega las páginas del catálogo.
3. Entra al detalle de un producto o agrégalo directamente al carrito. En **Carrito** puedes cambiar cantidades, eliminar productos o vaciarlo.
4. Usa **Iniciar sesión** para entrar con tu cuenta, o **Regístrate** para crear una con tu propio email y contraseña.
5. Para administrar el catálogo, inicia sesión con una cuenta autorizada y abre `/gestion`. Allí puedes agregar, editar, eliminar productos o importar el catálogo inicial.

## Email y contraseña

El email de la cuenta administradora es `admin@gmail.com`. La contraseña no se publica en este archivo: solicítala al administrador por un canal privado. Si la cuenta todavía usa `123456`, cámbiala por una contraseña segura en Firebase Authentication.

Para entrar al panel de gestión, además de iniciar sesión, tu cuenta debe tener autorización de administrador (`admin: true`) asignada desde un entorno confiable por un administrador del proyecto Firebase. Si no tienes esa autorización, podrás usar el catálogo y el carrito, pero no gestionar productos.
