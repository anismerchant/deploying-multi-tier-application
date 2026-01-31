# Runbook — Deploying Web App Using Ansible

This runbook describes the exact steps to deploy the web application safely.

## 1. Provision Infrastructure (Terraform)

Terraform is responsible only for EC2 and networking.

```bash
cd terraform
terraform init
terraform validate
terraform plan
terraform apply
````

Confirm:

* EC2 is running
* Public IP is assigned
* Port 22 and 80 are open

## 2. Verify SSH Access

From your local machine:

```bash
ssh -i ~/.ssh/deploying-web-app-using-ansible-key ubuntu@<EC2_PUBLIC_IP>
```

Expected:

* Successful login
* No sudo or permission errors

Exit the instance.

## 3. Update Ansible Inventory

Edit:

```
ansible/inventory.ini
```

Set:

* `ansible_host=<EC2_PUBLIC_IP>`
* `ansible_user=ubuntu`
* `ansible_ssh_private_key_file=~/.ssh/deploying-web-app-using-ansible-key`

Validate inventory:

```bash
ansible-inventory -i ansible/inventory.ini --list
```

## 4. Dry Run (Optional)

```bash
ansible-playbook -i ansible/inventory.ini ansible/playbook.yml --check
```

Use this to confirm task ordering and permissions.

## 5. Deploy Application

```bash
ansible-playbook -i ansible/inventory.ini ansible/playbook.yml
```

Expected:

* Nginx installed
* Site configuration written
* Site enabled
* Nginx reloaded

## 6. Verify Deployment

Open browser:

```
http://<EC2_PUBLIC_IP>/
```

Expected:

* Web app loads via Nginx

## 7. Re-run Safety

The playbook is idempotent. Re-running it should result in:

* No failures
* Minimal or no changes
