pipeline {
  agent any

  options {
    timestamps()
    buildDiscarder(logRotator(numToKeepStr: '20', artifactNumToKeepStr: '10'))
    disableConcurrentBuilds()
    timeout(time: 30, unit: 'MINUTES')
    skipDefaultCheckout(true)   // <-- CLAVE: sin checkout automático en cada node/etapa
  }

  environment {
    CI = 'true'
    NPM_CONFIG_CACHE = "${WORKSPACE}/.npm"
    CYPRESS_CACHE_FOLDER = "${WORKSPACE}/.cache/Cypress"
    npm_config_progress = 'false'
    npm_config_audit    = 'false'
  }

  stages {
    stage('Checkout') {
      steps {
        checkout scm
        // Guardamos el código sin .git ni node_modules
        stash name: 'src',
              includes: '**/*',
              excludes: '.git/**, **/.git/**, node_modules/**, .npm/**, .cache/**'
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
          // mismo workspace y usuario jenkins dentro del contenedor
          args "-v ${WORKSPACE}:${WORKSPACE} -w ${WORKSPACE}"
        }
      }
      steps {
        // Limpia el workspace de la etapa pero conserva caches
        sh 'find "$WORKSPACE" -mindepth 1 -maxdepth 1 -not -name ".npm" -not -name ".cache" -exec rm -rf {} + || true'

        // Trae el código *sin* .git
        unstash 'src'

        sh 'ls -la | sed -n "1,120p"'

        withEnv(["HOME=${WORKSPACE}"]) {
          retry(2) {
            sh '''
              if [ -f package-lock.json ]; then
                echo "[npm] package-lock.json encontrado → npm ci"
                npm ci --prefer-offline --no-audit --unsafe-perm
              else
                echo "[npm] NO hay package-lock.json → npm install"
                npm install --no-audit --no-fund
              fi
            '''
          }
        }

        // Por si quieres reusar deps en la siguiente etapa
        stash name: 'deps', includes: 'node_modules/**, package-lock.json', allowEmpty: true
      }
    }

    stage('Run Cypress tests (Docker)') {
      agent {
        docker {
          image 'cypress/included:13.11.0'
          args "--entrypoint='' -v ${WORKSPACE}:${WORKSPACE} -w ${WORKSPACE}"
        }
      }
      steps {
        // Mismo patrón: limpiar suave + traer código y deps
        sh 'find "$WORKSPACE" -mindepth 1 -maxdepth 1 -not -name ".npm" -not -name ".cache" -exec rm -rf {} + || true'
        unstash 'src'
        script { try { unstash 'deps' } catch (e) { echo "No hay stash de deps, instalaremos…" } }

        withEnv(["HOME=${WORKSPACE}"]) {
          sh '''
            if [ ! -d node_modules ]; then
              if [ -f package-lock.json ]; then
                npm ci --prefer-offline --no-audit --unsafe-perm
              else
                npm install --no-audit --no-fund
              fi
            fi

            npx cypress run --spec "cypress/e2e/**/*.feature"
          '''
        }
      }
      post {
        always {
          archiveArtifacts artifacts: 'cypress/screenshots/**, cypress/videos/**', allowEmptyArchive: true
        }
      }
    }
  }

  post {
    always {
      echo 'Pipeline finalizado.'
      // Limpia, pero conserva caches para acelerar el próximo build
      sh 'find "$WORKSPACE" -maxdepth 1 -mindepth 1 -not -name ".npm" -not -name ".cache" -exec rm -rf {} + || true'
    }
    failure { echo 'Build o tests fallaron — revisa consola y artefactos.' }
  }
}
