pipeline {
  agent any

  options {
    timestamps()
    ansiColor('xterm')
    // Guarda 20 builds y 10 juegos de artefactos
    buildDiscarder(logRotator(numToKeepStr: '20', artifactNumToKeepStr: '10'))
    // Evita colisiones de permisos/caches
    disableConcurrentBuilds()
    // Evita que un build se quede pegado
    timeout(time: 30, unit: 'MINUTES')
  }

  environment {
    CI = 'true'
    // Caches persistentes en el workspace
    NPM_CONFIG_CACHE = "${WORKSPACE}/.npm"
    CYPRESS_CACHE_FOLDER = "${WORKSPACE}/.cache/Cypress"
    // Menos ruido y un pelín más rápido
    npm_config_progress = 'false'
    npm_config_audit = 'false'
  }

  stages {
    stage('Checkout') {
      steps { checkout scm }
    }

    stage('Pre-pull images (warm cache)') {
      // Opcional, acelera el primer run
      steps {
        sh '''
          docker pull node:22
          docker pull cypress/included:13.11.0
        '''
      }
    }

    stage('Install dependencies') {
      agent {
        docker {
          image 'node:22'
          // Monta el workspace y trabaja ahí (Jenkins ya añadirá -u <uid>:<gid>)
          args "-v ${WORKSPACE}:${WORKSPACE} -w ${WORKSPACE}"
        }
      }
      steps {
        withEnv(["HOME=${WORKSPACE}"]) {
          retry(2) {
            sh 'npm ci --prefer-offline --no-audit --unsafe-perm'
          }
        }
        // Si quieres ahorrar reinstalaciones en el siguiente stage, puedes dejar node_modules tal cual.
        // Alternativamente, podrías 'stash/unstash' si usas agentes distintos con workspaces separados.
      }
    }

    stage('Run Cypress tests (Docker)') {
      agent {
        docker {
          image 'cypress/included:13.11.0'
          // Desactiva ENTRYPOINT para llevarse bien con Jenkins Docker plugin.
          // Monta el workspace y caches; Jenkins agregará -u <uid>:<gid> automáticamente.
          args "--entrypoint='' -v ${WORKSPACE}:${WORKSPACE} -w ${WORKSPACE} -v ${WORKSPACE}/.npm:${WORKSPACE}/.npm -v ${WORKSPACE}/.cache:${WORKSPACE}/.cache"
        }
      }
      steps {
        withEnv(["HOME=${WORKSPACE}"]) {
          // Si por alguna razón no existe node_modules (p. ej., workspace limpio), reinstala rápido desde cache
          sh '''
            if [ ! -d node_modules ]; then
              npm ci --prefer-offline --no-audit --unsafe-perm
            fi
          '''
          // Ejecuta Cypress (features con Cucumber)
          sh 'npx cypress run --spec "cypress/e2e/**/*.feature"'
        }
      }
      post {
        always {
          // Evidencias de Cypress
          archiveArtifacts artifacts: 'cypress/screenshots/**, cypress/videos/**', allowEmptyArchive: true
          // (Opcional) Si configuras JUnit en Cypress (reporter), publícalo:
          // junit allowEmptyResults: true, testResults: 'cypress/results/junit-*.xml'
        }
      }
    }
  }

  post {
    always {
      // Limpia el workspace, pero conserva caches si te interesan para acelerar el siguiente build.
      // Si quieres limpiar TODO, comenta las 2 líneas siguientes y usa cleanWs().
      sh 'find "$WORKSPACE" -maxdepth 1 -mindepth 1 -not -name ".npm" -not -name ".cache" -exec rm -rf {} + || true'
      echo 'Build finalizado.'
      // cleanWs()  // <- usa esto si prefieres limpieza total y no te importa perder caches
    }
    failure { echo 'Build o tests fallaron — revisa consola y artefactos.' }
  }
}
