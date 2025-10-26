#!/bin/bash

# Setup subdomains for localhost testing
# This script adds subdomain entries to /etc/hosts

echo "🌐 Setting up localhost subdomains for testing..."
echo ""

# Check if running as root or with sudo
if [ "$EUID" -ne 0 ]; then 
    echo "⚠️  This script needs sudo privileges to modify /etc/hosts"
    echo "Please run: sudo ./setup-subdomains.sh"
    exit 1
fi

# Backup hosts file
cp /etc/hosts /etc/hosts.backup.$(date +%Y%m%d_%H%M%S)
echo "✓ Created backup of /etc/hosts"

# Subdomains to add
SUBDOMAINS=(
    "ethertech.localhost"
    "acme.localhost"
    "webable.localhost"
)

# Check if entries already exist
for subdomain in "${SUBDOMAINS[@]}"; do
    if grep -q "$subdomain" /etc/hosts; then
        echo "✓ $subdomain already exists in /etc/hosts"
    else
        echo "127.0.0.1       $subdomain" >> /etc/hosts
        echo "✓ Added $subdomain"
    fi
done

echo ""
echo "✅ Subdomain setup complete!"
echo ""
echo "Added subdomains:"
for subdomain in "${SUBDOMAINS[@]}"; do
    echo "  - $subdomain"
done
echo ""
echo "You can now access these subdomains at:"
echo "  - http://ethertech.localhost:9614"
echo "  - http://acme.localhost:9614"
echo "  - http://webable.localhost:9614"
echo ""
echo "📝 Backup saved to: /etc/hosts.backup.*"
echo ""
echo "To verify, run: grep localhost /etc/hosts"
