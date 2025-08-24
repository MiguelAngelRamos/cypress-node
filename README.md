# Cypress + Cucumber + POM (DummyJSON e-commerce)

Suite E2E con Cypress 13 + Cucumber (Gherkin) usando Page Object Model.

## Cómo ejecutar

```bash
npm install
npm run open    # Modo interactivo (GUI)
# o
npm test        # Headless (CI)
```

- baseUrl: `https://ecommerce-e2e.netlify.app` (configurado en `cypress.config.js`).
- Credenciales usadas en tests (env): `USERNAME=emilys`, `PASSWORD=emilyspass`.

### Ejecutar un feature específico

```bash
npx cypress run --spec "cypress/e2e/features/regression/product_not_found.feature"
```

En modo interactivo, elige el spec desde la UI.

## Estructura del proyecto

- `cypress/e2e/features/`
	- `smoke/`
		- `happy_path.feature`
		- `guarded_route.feature`
		- `cart_ops.feature`
	- `regression/`
		- `search_filters.feature`
		- `product_not_found.feature`
- `cypress/support/pages/` (POM)
	- `HomePage.js`, `CatalogPage.js`, `ProductPage.js`, `CartPage.js`, `LoginPage.js`, `CheckoutPage.js`
- `cypress/support/step_definitions/`
	- `common.steps.js` (pasos genéricos reutilizables)
	- `smoke.steps.js` (pasos de smoke)
	- `regression.steps.js` (pasos de regresión)
- `cypress/support/e2e.js` (hooks y soporte común)

## Escenarios incluidos

### Smoke
- Happy path (`smoke/happy_path.feature`)
	- Home → Catálogo → Detalle → Agregar → Carrito → Checkout (redirige a login) → Login → Checkout (resumen)
- Ruta protegida (`smoke/guarded_route.feature`)
	- Intentar ir a checkout sin sesión redirige al login
- Operaciones de carrito (`smoke/cart_ops.feature`)
	- Cambiar cantidad, quitar producto, vaciar y validar totales/estado

### Regresión
- Búsqueda y filtros (`regression/search_filters.feature`)
	- Scenario Outline con ejemplos: phone, shirt, laptop
- Producto no encontrado (`regression/product_not_found.feature`)
	- Navegar manualmente a un id inválido muestra mensaje de error

## Organización de Steps y POM

- Los step definitions se dividen por propósito:
	- `common.steps.js`: Given/When/Then genéricos como "Given que estoy en el catálogo".
	- `regression.steps.js`: pasos específicos de regresión como
		- `When navego manualmente al detalle con id {int}`
		- `Then debo ver un mensaje de error en el detalle`.
	- `smoke.steps.js`: interacción de carrito, checkout, login, etc.
- Cucumber carga todos los steps y hace match por texto/regex sin importar el archivo.
- Los Steps llaman a los Page Objects bajo `support/pages` para mantener selectores y acciones encapsulados.

## Configuración clave (cypress.config.js)

- `specPattern`: `cypress/e2e/**/*.feature`
- Preprocesadores: Cucumber + esbuild
- `env`: `USERNAME`, `PASSWORD`
- `video: false`, `chromeWebSecurity: false`

## Agregar nuevos casos

1) Crear un nuevo `.feature` bajo `cypress/e2e/features/<carpeta>/` con Gherkin.
2) Implementar/usar Steps en `cypress/support/step_definitions/` (reutiliza los comunes cuando aplique).
3) Añadir métodos/selectores en el POM correspondiente en `cypress/support/pages/` si hace falta.
4) Ejecutar en GUI (`npm run open`) o headless (`npm test`).

## Tips y resolución de problemas

- Si cambias el host/puerto, actualiza `baseUrl` en `cypress.config.js`.
- Las credenciales de ejemplo están en `env`; puedes sobreescribirlas en CI.
- Usa `cy.intercept` y `cy.viewport` en Steps/POM si necesitas adaptar red.
- Para depurar, corre en GUI y usa `cy.log()` o el panel de comandos.

