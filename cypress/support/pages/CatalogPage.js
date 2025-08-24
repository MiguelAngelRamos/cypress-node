// Clase que representa la página de catálogo de productos
class CatalogPage {
  visit() { cy.visit("/products.html"); } // Navega a la página de productos
  grid() { return cy.get("#products-grid"); } // Obtiene el elemento de la grilla de productos
  firstProductViewBtn() { return cy.get("#products-grid .card a.btn").first(); } // Obtiene el botón de ver del primer producto
  searchInput() { return cy.get("#search"); } // Obtiene el campo de búsqueda
  filtersForm() { return cy.get("#filters-form"); } // Obtiene el formulario de filtros
}
export default new CatalogPage(); // Exporta una instancia de CatalogPage
