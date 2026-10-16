#!/usr/bin/env bash
# One-time hardening of the VM, after setup.sh. Run it as the SSH user: bash /opt/fat-guide/harden.sh
#   - SSH accepts keys only: no passwords, no root login.
#   - fail2ban blocks an IP for a while after repeated failed SSH logins.
#   - Ubuntu installs security updates by itself every day.
# Running it again changes nothing.
set -euo pipefail

if [ ! -s "$HOME/.ssh/authorized_keys" ]; then
  echo "No SSH key in ~/.ssh/authorized_keys: turning off password login would lock you out. Stopping." >&2
  exit 1
fi

# sshd reads sshd_config.d/ in name order and keeps the first value it sees, so this file must sort
# before 50-cloud-init.conf, which Azure writes with PasswordAuthentication yes on password VMs.
sudo tee /etc/ssh/sshd_config.d/01-fat-guide.conf >/dev/null <<'EOF'
PasswordAuthentication no
KbdInteractiveAuthentication no
PermitRootLogin no
EOF
sudo sshd -t
sudo systemctl reload ssh

sudo apt-get update
sudo apt-get install -y fail2ban unattended-upgrades
# Ubuntu's fail2ban package already enables the sshd jail.
sudo systemctl enable --now fail2ban

sudo tee /etc/apt/apt.conf.d/20auto-upgrades >/dev/null <<'EOF'
APT::Periodic::Update-Package-Lists "1";
APT::Periodic::Unattended-Upgrade "1";
EOF

echo "Done. Check: sudo fail2ban-client status sshd"
