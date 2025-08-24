pipeline {
  agent any

  options {
    timestamps()
    buildDiscarder(logRotator(numToKeepStr: '20', artifactNumToKeepStr: '10'))
    disableConcurrentBuilds()
    timeout(time: 30, unit: 'MINUTES')
    // newContainerPerStage()  // <- lo evitamos; usamos stash/unstash
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
        // Guardamos TODO el repo para recuperarlo en cualquier workspace
        stash name: 'src', includes: '**', useDefaultExcludes: false
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
          args "-v ${WORKSPACE}:${WORKSPACE} -w ${WORKSPACE}"
        }
      }
      steps {
        // Recuperamos el código en ESTE workspace (@2, @3, etc.)
        unstash 'src'
        sh 'echo "[debug] WORKSPACE=$WORKSPACE"'
        sh 'ls -la | sed -n "1,120p"'

        withEnv(["HOME=${WORKSPACE}"]) {
          retry(2) {
            sh '''
              if [ -f package-lock.json ]; then
                echo "[npm] package-lock.json encontrado → npm ci"
                npm ci --prefer-offline --no-audit --unsafe-perm
              else
                echo "[npm] NO hay package-lock.json → npm install y generamos lock"
                npm install --no-audit --no-fund
                test -f package-lock.json || npm install --package-lock-only
                echo "[npm] *** Sube package-lock.json al repo (rama actual) para builds reproducibles ***"
              fi
            '''
          }
        }
        // Guardamos node_modules por si quieres reusarlo en la etapa de Cypress
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
        // Traemos el código y, si existe, los deps
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
    always { echo 'Pipeline finalizado.' }
    failure { echo 'Build o tests fallaron — revisa consola y artefactos.' }
  }
}
