Feature: Camino feliz de compra
  Scenario: Home → Catálogo → Detalle → Agregar → Carrito → Login → Checkout
    Given que estoy en la página de inicio
    When voy al catálogo
    And abro el detalle del primer producto del catálogo
    And agrego el producto actual al carrito con cantidad 2
    And voy al carrito
    And navego a checkout
    Then debo ser redirigido al login
    When inicio sesión con credenciales válidas
    Then debo volver a checkout
    And debo ver el resumen del pedido
