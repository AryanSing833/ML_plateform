#!/bin/bash
# Install updates
yum update -y

# Install Docker
amazon-linux-extras install docker -y
systemctl start docker
systemctl enable docker
usermod -a -G docker ec2-user

# Install AWS CLI
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
./aws/install

# Pull model artifact from S3
mkdir -p /opt/ml/models
aws s3 cp s3://my-test-project-artifacts/models/production/model.pt /opt/ml/models/ || echo "No model found"

# Run container
docker run -d -p 8000:8000 -v /opt/ml/models:/app/models --name my-test-project-api my-test-project:latest
