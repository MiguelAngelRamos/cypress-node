# Plugins necesarios para Jenkins (proyecto Cypress)

Este documento lista los plugins mínimos y recomendados para ejecutar el `Jenkinsfile` incluido en este repo (Cypress + Cucumber en contenedores Docker). Incluye por qué se necesitan y comandos prácticos para instalarlos en una instancia de Jenkins en Ubuntu.

## Checklist rápido

- [x] Plugins imprescindibles para que el pipeline funcione
- [x] Plugins recomendados para reporting, multibranch y notificaciones
- [x] Comando `jenkins-plugin-cli` para instalación automatizada

---

## Plugins imprescindibles

- `workflow-aggregator` (Pipeline)
  - Por qué: soporte de Pipelines declarativos (Jenkinsfile). Necesario para ejecutar etapas y sintaxis declarativa.
- `docker-workflow` (Docker Pipeline)
  - Por qué: permite usar pasos Docker desde el pipeline (`docker.image(...).inside()`), usado para ejecutar Cypress dentro de contenedores.
- `git` (Git Plugin)
  - Por qué: permite `checkout scm` y demás operaciones Git en el job.
- `credentials` y `credentials-binding` (Credentials Plugin + Binding)
  - Por qué: inyectar credenciales de forma segura en pipelines (usuario/contraseña, tokens).
- `pipeline-utility-steps`
  - Por qué: utilidades comunes para pipeline (útiles en muchos scripts declarativos).

## Plugins recomendados (muy útiles)

- `htmlpublisher` (HTML Publisher Plugin)
  - Por qué: publicar reportes HTML generados por los tests (por ejemplo mochawesome HTML).
- `junit`
  - Por qué: publicar resultados en formato JUnit XML para la vista de test results de Jenkins.
- `github-branch-source` (o `bitbucket-branch-source` según tu VCS)
  - Por qué: multibranch pipeline y escaneo de PR/branches si usas integración con GitHub/Bitbucket.
- `blueocean` (opcional)
  - Por qué: UI moderna para visualizar pipelines (opcional).
- Notificaciónes (opcional): `slack`, `email-ext`, etc.

---

## Instalación recomendada (Ubuntu, CLI)

Si tu Jenkins tiene `jenkins-plugin-cli` disponible (instalado por paquetes oficiales), puedes instalar los plugins listados con un solo comando. Ejecuta esto en la máquina que hospeda Jenkins (requiere permisos sudo si no lo estás como jenkins):

```bash
sudo jenkins-plugin-cli --plugins \
  workflow-aggregator \
  docker-workflow \
  git \
  credentials-binding \
  pipeline-utility-steps \
  htmlpublisher \
  junit \
  github-branch-source

# Reinicia Jenkins (si la instalación no reinicia automáticamente)
sudo systemctl restart jenkins
```

Notas:
- Puedes añadir o quitar plugins del comando según necesites.
- `jenkins-plugin-cli` es parte de la distribución moderna de Jenkins y facilita la provisión automatizada.

## Instalación manual vía UI

1. Ir a Jenkins → Manage Jenkins → Manage Plugins → Available.
2. Buscar por nombre (ej: "Pipeline", "Docker Pipeline") y marcar para instalar.
3. Instalar sin reiniciar o instalar y reiniciar según prefieras.

## Consideraciones sobre Docker y permisos

- Si el pipeline usa el socket Docker del host (ej. `docker.image(...).inside()`), asegúrate de que el usuario `jenkins` tenga acceso al daemon Docker. Ejemplo:

```bash
sudo usermod -aG docker jenkins
sudo systemctl restart jenkins
```

Advertencia: dar acceso al socket Docker implica elevar privilegios y debe evaluarse según políticas de seguridad.

## Credenciales en Jenkins

- Para variables sensibles (usuario, contraseña, tokens), crea credenciales en:
  Jenkins → Credentials → (global) → Add Credentials
- En el `Jenkinsfile` usa `credentialsId` para inyectarlas (ejemplo con `withCredentials` o `environment` bindings).

## Publicar reportes de test

- Si quieres publicar resultados JUnit, añade un reporter que genere XML (por ejemplo el reporter JUnit o configurar Mochawesome para generar `junit` XML) y luego publica con el paso `junit` en el `Jenkinsfile`.
- Para HTML (mochawesome HTML), instala `htmlpublisher` y usa `publishHTML` en la sección `post { always { ... } }` del `Jenkinsfile`.

## Ejemplo breve de pasos adicionales en `Jenkinsfile`

```groovy
post {
  always {
    // Publicar JUnit XML
    junit allowEmptyResults: true, testResults: 'cypress/results/junit/*.xml'

    // Publicar reporte HTML (si generas uno)
    publishHTML(target: [
      reportDir: 'cypress/results/html',
      reportFiles: 'index.html',
      reportName: 'Cypress HTML Report',
      allowMissing: true
    ])
  }
}
```

## ¿Necesitas que instale los plugins en tu servidor Jenkins?

Puedo generar un script más completo para provisionar plugins y configurar credenciales, o actualizar el `Jenkinsfile` para publicar JUnit/Mochawesome si quieres. Indica cuál prefieres y lo implemento.

---

Archivo generado automáticamente para apoyar la integración continua del proyecto.
