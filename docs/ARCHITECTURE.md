### 1. Architecture Overview

State the evolution in one paragraph:

> This architecture builds on a Terraform + Ansible baseline and introduces Docker Compose to run a multi-tier application on a single EC2 host, reflecting common industry patterns for small to mid-scale deployments.

---

### 2. Responsibility Boundaries (critical)

```
Terraform
  - VPC / networking
  - Security groups
  - EC2 instance

Ansible
  - OS bootstrap
  - Docker + Docker Compose installation
  - Host readiness

Docker Engine
  - Container runtime

Docker Compose
  - Application orchestration
  - Service networking
```

---

### 3. System Architecture

```
Local Machine
   |
   | terraform apply
   v
AWS Infrastructure
   |
   | ansible-playbook
   v
EC2 Host
   |
   | Docker Engine
   v
Docker Compose
   |
   |-- frontend (8080)
   |-- api (5000)
   |-- database (3306, internal)
```

---

### 4. Data Flow (browser → DB)

```
Browser
  |
  | http://PUBLIC_IP:8080
  v
Frontend Container
  |
  | HTTP API call
  v
API Container
  |
  | SQL
  v
Database Container
```

**Key note:**
Only **8080** and **5000** are exposed publicly.
Database traffic stays on the Docker network.

---

### 5. Why Docker Compose Here

Short justification:

* Single-host, multi-service orchestration
* Simple service discovery
* Clear separation between infra, config, runtime

Host configuration (Ansible):
- Installs Docker Engine and Docker Compose (plugin)
- Starts Docker daemon
- Grants non-root docker access (docker group)

