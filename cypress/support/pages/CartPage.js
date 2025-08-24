// Clase que representa la página del carrito de compras
class CartPage {
  visit() { cy.visit("/cart.html"); } // Navega a la página del carrito
  table() { return cy.get("#cart-table"); } // Obtiene la tabla del carrito
  firstQtyInput() { return cy.get("#cart-table input.qty").first(); } // Obtiene el primer campo de cantidad en la tabla
  firstRemoveBtn() { return cy.get("#cart-table .remove").first(); } // Obtiene el primer botón de eliminar en la tabla
  clearBtn() { return cy.get("#clear"); } // Obtiene el botón para vaciar el carrito
  totalCell() { return cy.get("tfoot tr").last().find("th.text-end"); } // Obtiene la celda del total en el pie de la tabla
  emptyAlert() { return cy.get("#cart-table .alert-info"); } // Obtiene el mensaje de alerta cuando el carrito está vacío
}
export default new CartPage(); // Exporta una instancia de CartPage
