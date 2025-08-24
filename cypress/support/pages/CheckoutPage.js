class CheckoutPage {
  visit() { cy.visit("/checkout.html"); }
  summary() { return cy.get("#summary"); }
}
export default new CheckoutPage();
