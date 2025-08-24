Feature: Ruta protegida de checkout
  Scenario: Intentar ir a checkout sin sesión
    Given que estoy en el catálogo
    When navego a checkout
    Then debo ser redirigido al login
