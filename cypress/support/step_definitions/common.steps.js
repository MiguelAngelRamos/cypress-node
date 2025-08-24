// Importa los métodos Given, When, Then del preprocesador de cucumber para Cypress
import { Given, When, Then } from "@badeball/cypress-cucumber-preprocessor";
// Importa la clase HomePage para interactuar con la página de inicio
import HomePage from "../pages/HomePage";
// Importa la clase CatalogPage para interactuar con el catálogo de productos
import CatalogPage from "../pages/CatalogPage";
// Importa la clase ProductPage para interactuar con la página de detalle de producto
import ProductPage from "../pages/ProductPage";
// Importa la clase CartPage para interactuar con el carrito de compras
import CartPage from "../pages/CartPage";
// Importa la clase LoginPage para interactuar con la página de login
import LoginPage from "../pages/LoginPage";
// Importa la clase CheckoutPage para interactuar con la página de checkout
import CheckoutPage from "../pages/CheckoutPage";

// Home
Given("que estoy en la página de inicio", () => {
  HomePage.visit(); // Navega a la página de inicio
  HomePage.featuredGrid().should("exist"); // Verifica que la grilla de productos destacados existe
  HomePage.featuredCards().its("length").should("be.greaterThan", 0); // Verifica que hay al menos una tarjeta de producto destacado
});

// Catálogo
Given("que estoy en el catálogo", () => {
  CatalogPage.visit(); // Navega a la página de catálogo
  CatalogPage.grid().should("exist"); // Verifica que la grilla de productos existe
});

When("voy al catálogo", () => {
  CatalogPage.visit(); // Navega a la página de catálogo
  CatalogPage.grid().should("exist"); // Verifica que la grilla de productos existe
});

When("abro el detalle del primer producto del catálogo", () => {
  CatalogPage.firstProductViewBtn().click(); // Hace clic en el botón de ver del primer producto
  cy.location("pathname").should("include", "/product.html"); // Verifica que la URL contiene "/product.html"
  ProductPage.getDetailSection().should("exist"); // Verifica que la sección de detalle del producto existe
});

// Producto → Carrito
When("agrego el producto actual al carrito con cantidad {int}", (qty) => {
  ProductPage.getQuantityInput().clear().type(String(qty)); // Limpia el campo de cantidad y escribe la nueva cantidad
  ProductPage.getAddToCartButton().click(); // Hace clic en el botón de agregar al carrito
  cy.get(".alert.alert-success").should("exist"); // Verifica que aparece un mensaje de éxito
});

// Carrito
When("voy al carrito", () => {
  CartPage.visit(); // Navega a la página del carrito
  CartPage.table().should("exist"); // Verifica que la tabla del carrito existe
});

When("navego a checkout", () => {
  CheckoutPage.visit(); // Navega a la página de checkout
});

Then("debo ser redirigido al login", () => {
  cy.location("pathname").should("include", "/login.html"); // Verifica que la URL contiene "/login.html"
});

// Login
When("inicio sesión con credenciales válidas", () => {
  LoginPage.username().clear().type(Cypress.env("USERNAME")); // Limpia el campo de nombre de usuario y escribe el nombre de usuario
  LoginPage.password().clear().type(Cypress.env("PASSWORD"), { log: false }); // Limpia el campo de contraseña y escribe la contraseña
  LoginPage.submit().click(); // Hace clic en el botón de enviar
});

Then("debo volver a checkout", () => {
  cy.location("pathname", { timeout: 10000 }).should("include", "/checkout.html"); // Verifica que la URL contiene "/checkout.html"
});

Then("debo ver el resumen del pedido", () => {
  CheckoutPage.summary().should("exist"); // Verifica que la sección de resumen del pedido existe
});
