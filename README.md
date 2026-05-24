# my-test-project

Docker + Kubernetes + AWS EC2/S3 + Jenkins CI/CD

## 🚀 Quick Start

### Installation

```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### Usage

```bash
# Train the model
python src/train.py

# Run inference
python src/inference.py
```

## 🏗️ Architecture

This project is built using a modern MLOps stack tailored for **Classification**:

- **ML Framework**: Pytorch
- **Experiment Tracking**: Mlflow- **Deployment**: Kubernetes- **CI/CD**: Jenkins- **Cloud Provider**: Aws (ec2-s3)
## 📊 Project Structure

```
my-test-project/
├── src/                    # Source code for the ML project
│   ├── data/               # Data processing scripts
│   ├── features/           # Feature engineering
│   ├── models/             # Model architectures and utilities
│   ├── train.py            # Training pipeline entry point
│   └── inference.py        # Inference script / API server
├── configs/                # Configuration files
│   └── config.yaml
├── tests/                  # Unit tests
├── Dockerfile              # Container definition
├── docker-compose.yml      # Local container orchestration
├── k8s/                    # Kubernetes manifests
├── Jenkinsfile             # Jenkins CI/CD pipeline
├── cloud/                  # Cloud infrastructure templates
├── requirements.txt        # Python dependencies
├── Makefile                # Useful commands
└── README.md
```

## 🛠️ Commands

You can use `make` to run common tasks:

```bash
make install      # Install dependencies
make train        # Run training script
make test         # Run unit tests
make lint         # Lint code
make clean        # Clean up cache files
```

## 🐳 Docker

Build and run the container locally:

```bash
# Build the image
docker build -t my-test-project:latest .

# Run the container
docker run -p 8000:8000 my-test-project:latest

# Or use docker-compose
docker-compose up -d
```

## ☸️ Kubernetes

Deploy to a Kubernetes cluster:

```bash
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/
```

## ☁️ Cloud Deployment

Deployment scripts for **Aws** are available in the `cloud/` directory.

```bash
cd cloud/aws/ec2-s3
./deploy.sh
```

## 📝 License

This project is licensed under the MIT License.

## 👥 Author

**ML Engineer**

---

Generated with [MLOps Project Generator](https://github.com/NotHarshhaa/MLOps-Project-Generator)