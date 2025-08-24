class HomePage {
  visit() { cy.visit("/index.html"); }
  featuredGrid() { return cy.get("#featured-grid"); }
  featuredCards() { return cy.get("#featured-grid .card"); }
  goToCatalog() { cy.visit("/products.html"); }
}
export default new HomePage();
