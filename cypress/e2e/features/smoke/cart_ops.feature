Feature: Operaciones básicas del carrito
  Background:
    Given que estoy en el catálogo
    When abro el detalle del primer producto del catálogo
    And agrego el producto actual al carrito con cantidad 1
    And voy al carrito

  Scenario: Cambiar cantidad, quitar producto y vaciar
    When cambio la cantidad del primer ítem a 3
    Then los totales deben actualizarse
    When quito el primer ítem del carrito
    Then el carrito puede quedar vacío o los totales deben disminuir
    When vacío el carrito
    Then debo ver el mensaje de carrito vacío
