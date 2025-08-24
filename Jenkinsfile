pipeline {
  agent any

  options {
    timestamps()
    buildDiscarder(logRotator(numToKeepStr: '20', artifactNumToKeepStr: '10'))
    disableConcurrentBuilds()
    timeout(time: 30, unit: 'MINUTES')
    // Si tienes el plugin, descomenta:
    // wrap([$class: 'AnsiColorBuildWrapper', colorMapName: 'xterm'])
  }

  environment {
    CI = 'true'
    NPM_CONFIG_CACHE = "${WORKSPACE}/.npm"
    CYPRESS_CACHE_FOLDER = "${WORKSPACE}/.cache/Cypress"
    npm_config_progress = 'false'
    npm_config_audit = 'false'
  }

  stages {
    stage('Checkout') {
      steps { checkout scm }
    }

    stage('Pre-pull images (warm cache)') {
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
          // Mismo workspace en el contenedor
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
          // Desactiva ENTRYPOINT y usa mismo workspace y caches
          args "--entrypoint='' -v ${WORKSPACE}:${WORKSPACE} -w ${WORKSPACE} -v ${WORKSPACE}/.npm:${WORKSPACE}/.npm -v ${WORKSPACE}/.cache:${WORKSPACE}/.cache"
        }
      }
      steps {
        withEnv(["HOME=${WORKSPACE}"]) {
          // Si por cualquier razón no existe node_modules, reinstala rápido desde cache
          sh '''
            if [ ! -d node_modules ]; then
              npm ci --prefer-offline --no-audit --unsafe-perm
            fi
          '''
          sh 'npx cypress run --spec "cypress/e2e/**/*.feature"'
        }
      }
      post {
        always {
          archiveArtifacts artifacts: 'cypress/screenshots/**, cypress/videos/**', allowEmptyArchive: true
          // junit allowEmptyResults: true, testResults: 'cypress/results/junit-*.xml'  // (si configuras JUnit)
        }
      }
    }
  }

  post {
    always {
      // Limpia, pero conserva caches para acelerar el próximo build
      sh 'find "$WORKSPACE" -maxdepth 1 -mindepth 1 -not -name ".npm" -not -name ".cache" -exec rm -rf {} + || true'
    }
    failure {
      echo 'Build o tests fallaron — revisa consola y artefactos.'
    }
  }
}
