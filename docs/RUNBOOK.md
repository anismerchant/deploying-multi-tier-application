### 1. Prerequisites

```
- AWS account
- Terraform installed
- Ansible installed
- SSH access to EC2
- Docker & Docker Compose (installed via Ansible)
```

---

### 2. Infrastructure Provisioning (Terraform)

```
terraform init
terraform plan
terraform apply
```

**Outcome:**

* EC2 instance created
* Security group allows: 22, 8080, 5000

---

### 3. Host Configuration (Ansible)

```
ansible-playbook -i inventory.ini bootstrap.yml
ansible-playbook -i inventory.ini playbook.yml
```

**What this does:**

* Installs Docker
* Installs Docker Compose
* Prepares host for containers

---

### 4. Application Deployment (Docker Compose)

From EC2:

```
cd docker/
docker-compose up -d
```

**Outcome:**

* Frontend container running
* API container running
* Database container running

---

### 5. Verification

From browser:

```
http://<EC2_PUBLIC_IP>:8080
```

Expected:

* Frontend loads
* Frontend can reach API
* API can reach database

---

### 6. Shutdown (optional)

```
docker-compose down
```

---

## Execution Order

```
terraform apply
      ↓
ansible-playbook
      ↓
docker-compose up
      ↓
browser verification
```
