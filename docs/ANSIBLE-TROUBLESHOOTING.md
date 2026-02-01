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
````

* Confirm inventory values:

  * `ansible_user=ubuntu`
  * `ansible_ssh_private_key_file` path is correct

---

## Inventory Errors

### Error: No hosts matched

**Cause**

* Inventory syntax error
* Wrong group name

**Fix**

```bash
ansible-inventory -i ansible/inventory.ini --list
```

Ensure hosts appear under the expected group.

---

## Permission Errors on Remote Host

### Error: permission denied writing to /etc/nginx or /var/www

**Cause**

* Missing privilege escalation

**Fix**

* Ensure playbook uses:

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

* Invalid template syntax
* Port 80 already in use

---

## Idempotency Check

Re-run:

```bash
ansible-playbook -i ansible/inventory.ini ansible/playbook.yml
```

Expected:

* No failures
* Minimal changes

If tasks change every run, review:

* `copy` vs `template`
* file permissions


## Docker & Docker Compose Troubleshooting

### 1. Docker not installed / command not found

**Symptom**

```
docker: command not found
```

**Cause**

* Docker role did not run or failed

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

* Compose binary/plugin not installed

**Fix**

* Re-run Ansible playbook
* Verify:

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

* EC2 security group allows **8080** and **5000**
* Containers are running:

```
docker ps
```

* Correct public IP used in browser

---

### 4. API cannot reach database

**Symptom**

* Frontend loads
* API errors on DB calls

**Cause**

* Wrong DB hostname

**Fix**

* Use **service name** from `docker-compose.yml`
* Never use `localhost` between containers

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
