# Ansible Troubleshooting — Web App Deployment

Common issues and how to fix them when deploying the web app using Ansible.

## SSH / Connectivity Issues

### Error: UNREACHABLE / Permission denied (publickey)

**Cause**

- Wrong SSH key
- Wrong user
- EC2 IP changed

**Fix**

- Verify SSH manually:

```bash
ssh -i ~/.ssh/deploying-web-app-using-ansible-key ubuntu@<EC2_PUBLIC_IP>
```

- Confirm inventory values:
  - `ansible_user=ubuntu`
  - `ansible_ssh_private_key_file` path is correct

---

## Inventory Errors

### Error: No hosts matched

**Cause**

- Inventory syntax error
- Wrong group name

**Fix**

```bash
ansible-inventory -i ansible/inventory.ini --list
```

Ensure hosts appear under the expected group.

---

## Permission Errors on Remote Host

### Error: permission denied writing to /etc/nginx or /var/www

**Cause**

- Missing privilege escalation

**Fix**

- Ensure playbook uses:

```yaml
become: true
```

---

## Nginx Issues

### Error: nginx failed to start / reload

**Fix**
SSH into EC2 and test config:

```bash
sudo nginx -t
sudo systemctl status nginx
```

Common causes:

- Invalid template syntax
- Port 80 already in use

---

## Idempotency Check

Re-run:

```bash
ansible-playbook -i ansible/inventory.ini ansible/playbook.yml
```

Expected:

- No failures
- Minimal changes

If tasks change every run, review:

- `copy` vs `template`
- file permissions

## Docker & Docker Compose Troubleshooting

### 1. Docker not installed / command not found

**Symptom**

```
docker: command not found
```

**Cause**

- Docker role did not run or failed

**Fix**

```
ansible-playbook -i inventory.ini bootstrap.yml
```

Verify:

```
docker --version
```

---

### 2. Docker Compose not found

**Symptom**

```
docker-compose: command not found
```

**Cause**

- Compose binary/plugin not installed

**Fix**

- Re-run Ansible playbook
- Verify:

```
docker compose version
```

or

```
docker-compose --version
```

---

### 3. Containers start but app not reachable

**Checklist**

- EC2 security group allows **8080** and **5000**
- Containers are running:

```
docker ps
```

- Correct public IP used in browser

---

### 4. API cannot reach database

**Symptom**

- Frontend loads
- API errors on DB calls

**Cause**

- Wrong DB hostname

**Fix**

- Use **service name** from `docker-compose.yml`
- Never use `localhost` between containers

---

### 5. Port already in use

**Symptom**

```
bind: address already in use
```

**Fix**

```
sudo lsof -i :8080
sudo lsof -i :5000
```

Stop conflicting service or change port mapping.

## Docker Installation via Ansible Role

### Purpose

This section explains how the `roles/docker` Ansible role prepares an EC2 host to
run Docker Compose–based applications.

---

## What Each Task Does (and Why)

**File:** `ansible/roles/docker/tasks/main.yml`  
**Goal:** Make the EC2 host _Docker-ready_ so `docker compose up` can be executed
later as part of application deployment.

---

### 1) Install Prerequisite Packages

**What it does**  
Installs basic tools required to securely add and verify external software
repositories.

- `ca-certificates` → trusted HTTPS certificates
- `curl` → download keys and files
- `gnupg` → cryptographic verification
- `lsb-release` → detects Ubuntu codename (e.g. `jammy`)

**Why**  
Docker is installed from Docker’s official repository, which requires these
tools for secure setup.

---

### 2) Add Docker GPG Key

**What it does**  
Adds Docker’s signing key to the system.

**Why**  
Ensures Docker packages are **authentic and trusted**, preventing tampered or
unverified installs.

---

### 3) Add Docker APT Repository

**What it does**  
Registers Docker’s official APT repository with the system.

- Uses `{{ ansible_lsb.codename }}` to automatically match the Ubuntu release.

**Why**  
Ubuntu’s default Docker packages may be outdated. The official Docker repository
is the industry-standard source.

---

### 4) Install Docker Engine and Docker Compose

**Installs**

- `docker-ce` → Docker engine (daemon)
- `docker-ce-cli` → Docker CLI (`docker`)
- `containerd.io` → container runtime
- `docker-buildx-plugin` → modern build features
- `docker-compose-plugin` → `docker compose` (Compose v2)

**Why**  
Provides the modern, production-grade Docker stack used in professional
environments.

---

### 5) Ensure Docker Service Is Running

**What it does**  
Starts Docker and enables it on system boot.

**Why**  
Containers cannot run unless the Docker daemon is active.

---

### 6) Add User to Docker Group

**What it does**  
Adds the SSH user to the `docker` group so Docker commands can be run without
`sudo`.

**Why**  
Enables a clean workflow:

```
docker ps
docker compose up
```

**Important**  
Group membership changes require re-login:

```
exit
ssh back in
```

## Mental Model

```
Ansible
|
v
[ EC2 Host ]
|
+-- add Docker GPG key        (trust)
+-- add Docker apt repo       (source)
+-- install Docker engine     (runtime)
+-- install Docker Compose    (orchestration)
+-- start Docker daemon
+-- grant non-root access
```

Nginx acts as a reverse proxy, routing /api/* requests to the internal API service over the Docker network.