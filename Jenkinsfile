pipeline {
    agent any

    environment {
        IMAGE_NAME = "aryansingh833/aryansingh833:latest"
        EC2_IP = "13.62.240.163"
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build Docker Image') {
            steps {
                sh 'docker build -t $IMAGE_NAME .'
            }
        }

        stage('Push Docker Image') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'dockerhub-creds',
                    usernameVariable: 'DOCKER_USER',
                    passwordVariable: 'DOCKER_PASS'
                )]) {

                    sh '''
                    echo $DOCKER_PASS | docker login -u $DOCKER_USER --password-stdin
                    docker push $IMAGE_NAME
                    '''
                }
            }
        }

        stage('Deploy to EC2') {
            steps {
                sshagent(credentials: ['ec2-ssh-key']) {
                    sh '''
                    ssh -o StrictHostKeyChecking=no ubuntu@$EC2_IP "
                    docker pull $IMAGE_NAME &&
                    docker stop rag-app || true &&
                    docker rm rag-app || true &&
                    docker run -d --name rag-app --env-file .env -p 80:8000 $IMAGE_NAME
                    "
                    '''
                }
            }
        }
    }
}