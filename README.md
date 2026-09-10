# Tiny-Trotters
## Failover
### Render Setup
  - Environment Group created
  - Production and Staging environments linked to the Environment Group
### Render Failover Manual Steps
  - Production service:  Settings -> Custom Domains
  - Delete yourdomain.com
  - Staging service:  Settings -> Add Custom Domain -> add yourdomain.com
  - In DNS provider:  edit DNS CNAME or ALIAS record. change target from production default URL (e.g., prod-app.....com) to your staging default URL (e.g., staging-app......com).
