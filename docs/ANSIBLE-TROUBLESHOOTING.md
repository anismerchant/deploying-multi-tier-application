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
