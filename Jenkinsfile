// Declarative Jenkins pipeline for this Cypress + Cucumber project.
// Assumptions:
// - Jenkins runs on Ubuntu and has Docker available to launch containers.
// - Docker daemon is usable by the Jenkins user (or configured via Docker plugin).
// - Sensitive variables (if any) should be provided via Jenkins Credentials.

pipeline {
  // Use any available agent on the Jenkins controller/agents.
  agent any

  environment {
    // CI flag available to tests. Override or add other env vars via Jenkins config.
    CI = 'true'
    // EXAMPLE: if you add credentials in Jenkins, inject them here instead of hardcoding
    // To use credentials, uncomment and set credentialsId in the pipeline or Job configuration.
    // Example (uncomment to use):
    // withCredentials([usernamePassword(credentialsId: 'e2e-creds', usernameVariable: 'E2E_USER', passwordVariable: 'E2E_PASS')]) { ... }
  }

  stages {
    stage('Checkout') {
      steps {
        // Checkout the source configured by this Jenkins job (branch/PR/etc.)
        checkout scm
      }
    }

    stage('Install dependencies') {
      // Run npm install inside a Node container to avoid polluting the Jenkins agent
      agent {
        docker { image 'node:22' }
      }
      steps {
        // Use npm ci for reproducible installs; falls back to npm install if no lockfile.
          withEnv(["HOME=${WORKSPACE}"]) {
            sh 'npm ci --cache "$WORKSPACE/.npm" --prefer-offline --no-audit --unsafe-perm'
          }
      }
    }

    stage('Run Cypress tests (Docker)') {
      // Run tests inside the official Cypress included image which already contains Cypress.
      steps {
        script {
          // Use the cypress/included image matching the Cypress version in package.json.
          docker.image('cypress/included:13.11.0').inside('--user 0') {
              // Re-install inside the cypress container but make npm use the workspace cache
              // to avoid permission problems and speed up installs.
              sh 'npm ci --cache "$WORKSPACE/.npm" --prefer-offline --no-audit --unsafe-perm'

            // Run all feature specs. To run a single feature change the --spec argument.
            sh 'npx cypress run --spec "cypress/e2e/**/*.feature"'
          }
        }
      }
    }
  }

  post {
    always {
      // Archive screenshots and videos if Cypress produced them
      archiveArtifacts artifacts: 'cypress/screenshots/**, cypress/videos/**', allowEmptyArchive: true

      // Optionally publish HTML reports if your pipeline generates them.
      // The publishHTML step requires the HTML Publisher Plugin in Jenkins.
      //publishHTML(target: [
      //  allowMissing: true,
      //  alwaysLinkToLastBuild: false,
      //  keepAll: true,
      //  reportDir: 'cypress/results',
      //  reportFiles: 'index.html',
      //  reportName: 'Cypress Report'
      //])
    }

    failure {
      // On failure, print a short hint. You can add notifications (Slack/email) here.
      echo 'Build or tests failed - check archived artifacts and console output.'
    }
  }
}
