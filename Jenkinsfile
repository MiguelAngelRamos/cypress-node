pipeline {
  agent any

  options {
    timestamps()
    buildDiscarder(logRotator(numToKeepStr: '20', artifactNumToKeepStr: '10'))
    disableConcurrentBuilds()
    timeout(time: 30, unit: 'MINUTES')
    skipDefaultCheckout(true)          // evita el checkout implícito de Jenkins
    newContainerPerStage()             // contenedor limpio por etapa
    // Si tienes el plugin AnsiColor, puedes activar colores:
    // wrap([$class: 'AnsiColorBuildWrapper', colorMapName: 'xterm'])
  }

  environment {
    CI = 'true'
    // caches dentro del workspace (propiedad de Jenkins, no root)
    NPM_CONFIG_CACHE = "${WORKSPACE}/.npm"
    CYPRESS_CACHE_FOLDER = "${WORKSPACE}/.cache/Cypress"
    npm_config_progress = 'false'
    npm_config_audit    = 'false'
  }

  stages {
    stage('Checkout') {
      steps { checkout scm }
    }

    // Repara una vez si quedaron archivos del pasado con dueño root
    stage('Fix workspace ownership (one-off)') {
      steps {
        sh '''
          JUID=$(id -u)
          JGID=$(id -g)
          # ¿Hay algo que NO sea del usuario Jenkins?
          if find "$WORKSPACE" -mindepth 1 \\( ! -user "$JUID" -o ! -group "$JGID" \\) | head -n1 | grep -q .; then
            echo "[info] Corrigiendo ownership del workspace (solo si era necesario)…"
            docker run --rm -u 0:0 -v "$WORKSPACE":"$WORKSPACE" -w "$WORKSPACE" alpine \
              sh -lc "chown -R $JUID:$JGID ."
          fi
        '''
      }
    }

    stage('Pre-pull images (warm cache)') {
      steps {
        sh '''
          docker pull -q node:22 || docker pull node:22
          docker pull -q cypress/included:13.11.0 || docker pull cypress/included:13.11.0
        '''
      }
    }

    stage('Install dependencies') {
      agent {
        docker {
          image 'node:22'
          // mismo workspace en el contenedor; Jenkins ya inyecta -u <jenkins>
          args "-v ${WORKSPACE}:${WORKSPACE} -w ${WORKSPACE}"
        }
      }
      steps {
        withEnv(["HOME=${WORKSPACE}"]) {
          retry(2) {
            sh 'npm ci --prefer-offline --no-audit --unsafe-perm'
          }
        }
      }
    }

    stage('Run Cypress tests (Docker)') {
      agent {
        docker {
          image 'cypress/included:13.11.0'
          // Anula ENTRYPOINT; usa el mismo workspace
          args "--entrypoint='' -v ${WORKSPACE}:${WORKSPACE} -w ${WORKSPACE}"
        }
      }
      steps {
        withEnv(["HOME=${WORKSPACE}"]) {
          // si no hay node_modules (ej. workspace limpio), reinstala rápido
          sh 'test -d node_modules || npm ci --prefer-offline --no-audit --unsafe-perm'
          retry(2) {
            sh 'npx cypress run --spec "cypress/e2e/**/*.feature"'
          }
        }
      }
      post {
        always {
          archiveArtifacts artifacts: 'cypress/screenshots/**, cypress/videos/**', allowEmptyArchive: true
          // Si configuras reporter JUnit:
          // junit allowEmptyResults: true, testResults: 'cypress/results/junit-*.xml'
        }
      }
    }
  }

  post {
    always {
      echo 'Pipeline finalizado.'
      // No limpiamos el workspace completo para conservar caches (.npm/.cache) y acelerar el próximo build.
      // npm ci ya se encarga de reemplazar node_modules de forma reproducible.
    }
    failure {
      echo 'Build o tests fallaron — revisa consola y artefactos.'
    }
  }
}
