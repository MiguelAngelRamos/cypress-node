class ProductPage {
    getDetailSection() {
        return cy.get("#product-detail"); // Devuele el elemento del detalle del producto
    }

    getQuantityInput() {
        return cy.get("#qty");
    }

    getAddToCartButton() {
        return cy.get("#add");
    }

}

export default new ProductPage();