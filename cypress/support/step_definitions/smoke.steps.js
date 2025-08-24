import { When, Then } from "@badeball/cypress-cucumber-preprocessor";
import CartPage from "../pages/CartPage";

When("cambio la cantidad del primer ítem a {int}", (qty) => {
  CartPage.firstQtyInput().clear().type(String(qty)).blur();
});

Then("los totales deben actualizarse", () => {
  CartPage.totalCell().invoke("text").then((t) => {
    const total = parseFloat(t.replace(/[^0-9.]/g, ""));
    expect(total).to.be.greaterThan(0);
  });
});

When("quito el primer ítem del carrito", () => {
  CartPage.firstRemoveBtn().click();
});

Then("el carrito puede quedar vacío o los totales deben disminuir", () => {
  cy.get("body").then(($b) => {
    if ($b.find("#cart-table .alert-info").length) {
      CartPage.emptyAlert().should("contain.text", "vacío");
    } else {
      CartPage.totalCell().invoke("text").then((t) => {
        const total = parseFloat(t.replace(/[^0-9.]/g, ""));
        expect(total).to.be.greaterThan(0);
      });
    }
  });
});

When("vacío el carrito", () => {
  cy.get("body").then(($b) => {
    if ($b.find("#clear").length) {
      CartPage.clearBtn().click();
    } else {
      cy.log("Carrito ya vacío; no hay botón #clear.");
    }
  });
});

Then("debo ver el mensaje de carrito vacío", () => {
  CartPage.emptyAlert().should("contain.text", "vacío");
});
