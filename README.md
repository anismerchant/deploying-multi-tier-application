
### 1. Project Overview (top section)

Explain evolution, briefly:

> This project builds on the previous *deploying-web-app-using-ansible* baseline and introduces **Docker Compose** to deploy a **multi-tier application** on AWS EC2, following industry-standard DevOps separation of concerns.

---

### 2. Tool Responsibility Matrix

This is critical and concise:

```
Terraform  → Infrastructure (VPC, Security Group, EC2)
Ansible    → Host configuration (Docker, Docker Compose)
Docker     → Container runtime
Docker Compose → Multi-tier application orchestration
```

---

### 3. High-Level Architecture (ASCII)

Add this exact style (keep it simple):

```
Local Machine
   |
   | terraform apply
   v
AWS EC2
   |
   | ansible-playbook
   v
Docker Engine
   |
   | docker-compose up
   v
--------------------------------
| Frontend | API | Database    |
--------------------------------
```

---

### 4. Repository Structure (update only)

Reference what already exists:

```
terraform/   → infrastructure
ansible/     → host configuration
docker/      → multi-tier application (Docker Compose)
docs/        → architecture, runbook, troubleshooting
```
