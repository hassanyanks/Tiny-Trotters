# Tiny-Trotters
## Manual Failover
  ### Pre-requisites:  Cloudflare, Hostinger, and Render configuration
    - To ensure your manual failover works smoothly on the free tier, complete these setup steps:1. Pre-register the Domain on Both Services (The Trick)To bypass Render's single-domain restriction, you can trick the system using a slight variation:Go to your Production Service -> Custom Domains, and add yourdomain.com.Go to your Staging Service -> Custom Domains, and add a backup variant like ://yourdomain.com (or vice versa). [1] (https://render.com/docs/custom-domains)This forces Render to issue and validate SSL certificates for both services ahead of time
  ### Manual Failover Steps
    - If production goes down:
      - You go to your Cloudflare DNS pane
      - You edit your root domain (@) and www CNAME records, changing the target from prod-app.onrender.com to staging-app.onrender.com.You save.
