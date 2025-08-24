class LoginPage {
  username() { return cy.get("#username"); }
  password() { return cy.get("#password"); }
  submit() { return cy.get("button[type=submit]"); }
}
export default new LoginPage();
