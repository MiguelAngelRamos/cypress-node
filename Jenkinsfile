pipeline {
  agent any

  stages {
    stage('Checkout') {
      steps { checkout scm }
    }

    stage('Install dependencies') {
      agent { docker { image 'node:22' } }
      steps {
        withEnv(["HOME=${WORKSPACE}"]) {
          sh 'npm ci --cache "$WORKSPACE/.npm" --prefer-offline --no-audit --unsafe-perm'
        }
      }
    }

    stage('Run Cypress tests (Docker)') {
      agent {
        docker {
          image 'cypress/included:13.11.0'
          // Desactiva ENTRYPOINT y levanta como root para evitar permisos
          args '--entrypoint="" -u 0 -v $WORKSPACE/.npm:/root/.npm -v $WORKSPACE/.cache:/root/.cache'
        }
      }
      steps {
        // Reutiliza cache de npm y de Cypress dentro del contenedor
        withEnv(["HOME=/root"]) {
          sh 'npm ci --cache "/root/.npm" --prefer-offline --no-audit --unsafe-perm'
          sh 'npx cypress run --spec "cypress/e2e/**/*.feature"'
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
    failure { echo 'Build o tests fallaron — revisa consola y artefactos.' }
  }
}
