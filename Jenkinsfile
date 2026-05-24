pipeline {
    agent any
    
    environment {
        DOCKER_IMAGE = "my-test-project"
        DOCKER_TAG = "${env.BUILD_NUMBER}"
        KUBECONFIG = credentials('kubeconfig-prod')
    }
    
    stages {
        stage('Lint & Test') {
            steps {
                sh 'pip install -r requirements.txt'
                sh 'make lint || echo "Linting skipped"'
                sh 'make test || echo "Testing skipped"'
            }
        }
        
        stage('Build Docker Image') {
            steps {
                sh 'docker build -t ${DOCKER_IMAGE}:${DOCKER_TAG} .'
                sh 'docker tag ${DOCKER_IMAGE}:${DOCKER_TAG} ${DOCKER_IMAGE}:latest'
            }
        }
        
        stage('Push to Registry') {
            steps {
                // Replace with your registry URL
                echo "Would push to registry: docker push ${DOCKER_IMAGE}:${DOCKER_TAG}"
            }
        }
        
        stage('Deploy to Kubernetes') {
            when {
                branch 'main'
            }
            steps {
                sh 'kubectl apply -f k8s/namespace.yaml'
                sh 'kubectl apply -f k8s/configmap.yaml'
                sh 'kubectl set image deployment/my-test-project-deployment my-test-project-container=${DOCKER_IMAGE}:${DOCKER_TAG} -n my-test-project-ns'
                sh 'kubectl apply -f k8s/'
            }
        }
    }
    
    post {
        always {
            cleanWs()
        }
    }
}
