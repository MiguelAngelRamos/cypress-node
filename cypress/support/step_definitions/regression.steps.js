import { When, Then } from "@badeball/cypress-cucumber-preprocessor";
import CatalogPage from "../pages/CatalogPage";

When("escribo {string} en el buscador y aplico filtros", (q) => {
  CatalogPage.searchInput().clear().type(q);
  CatalogPage.filtersForm().within(() => {
    cy.root().find("button[type=submit]").click();
  });
});

Then("debo ver resultados relacionados con {string}", () => {
  CatalogPage.grid().find(".card").its("length").should("be.greaterThan", 0);
});

When("navego manualmente al detalle con id {int}", (id) => {
  cy.visit(`/product.html?id=${id}`);
});

Then("debo ver un mensaje de error en el detalle", () => {
  cy.get("#product-detail .alert.alert-danger").should("exist");
});
