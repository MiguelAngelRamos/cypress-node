Feature: Producto no encontrado
  Scenario: Navegar a detalle con id inválido
    Given que estoy en el catálogo
    When navego manualmente al detalle con id 999999
    Then debo ver un mensaje de error en el detalle
