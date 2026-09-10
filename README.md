# Tiny-Trotters
## Manual Failover
  ### Pre-requisites:  Cloudflare, Hostinger, and Render configuration
  ### Manual Failover Steps
    - If production goes down:
      - You go to your Cloudflare DNS pane
      - You edit your root domain (@) and www CNAME records, changing the target from prod-app.onrender.com to staging-app.onrender.com.You save.
