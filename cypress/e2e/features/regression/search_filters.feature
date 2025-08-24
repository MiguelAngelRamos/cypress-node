Feature: Búsqueda y filtros en catálogo
  Scenario Outline: Buscar por texto
    Given que estoy en el catálogo
    When escribo "<q>" en el buscador y aplico filtros
    Then debo ver resultados relacionados con "<q>"
    Examples:
      | q      |
      | phone  |
      | shirt  |
      | laptop |
