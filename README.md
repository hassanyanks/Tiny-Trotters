# Tiny-Trotters
## Manual Failover
  ### Pre-requisites:  Cloudflare, Hostinger, and Render configuration
    - To ensure your manual failover works smoothly on the free tier, complete these setup steps:
        - Cloudflare
          * to transfer from Hostinger to Cloudflare, enter hostinger as your DNS provider and Cloudflare will copy all DNS records
        - Render:  Pre-register the Domain on Both Services (The Trick)
          * To bypass Render's single-domain restriction, you can trick the system using a slight variation  
            - Go to your Production Service -> Custom Domains, and add yourdomain.com.
            - Go to your Staging Service -> Custom Domains, and add a backup variant like ://yourdomain.com (or vice versa). 
              * This forces Render to issue and validate SSL certificates for both services ahead of time
        - On Hostinger, delete the original nameserves, replacing them with the Cloudflare nameservers
  ### Manual Failover Steps
    - What to do during an Emergency
       * If your production server crashes, you must change settings in both dashboards. 
       * Because Cloudflare eliminates DNS propagation time, your site will still recover in under a minute [1.5]:Step 1 
       * Step 1 (In Render): 
         - Go to your Production Service settings, scroll to Custom Domains, and delete yourdomain.com. 
         - Then immediately go to your Staging Service settings, click Add Custom Domain, and paste yourdomain.com
           + Because Render already has valid SSL logs for your domain infrastructure, this attaches instantly.
        * Step 2 (In Cloudflare)
          - Go to your DNS Records
          - edit your root (@) and www CNAME records
          - switch the target string from your production Render URL to your staging Render URL. 
          - Click Save
        * Step 3
          - In Render staging environment and under individual Environment Variables
          - temporarily change your environment flag (e.g., NODE_ENV) from staging to production 
            * (or delete it if you want it to pull directly from your shared Production Env Group).

  ## Downtime/Incident Alerting
      - Passive Origin Monitoring (For your server downtime)Cloudflare automatically watches the traffic flowing to your server. 
        * If your origin web server becomes completely unreachable from the Cloudflare edge network for over 5 minutes, it will trigger an email. 
        * How to enable it
          - Log in to the Cloudflare Dashboard.
          - Select your account and go to Notifications on the left menu.
          - Click Add and look for Passive Origin Monitoring.
          - Enter your email address and click Create. 
      - Cloudflare Incident Alerts (For Cloudflare outages)
        * Sometimes your server is fine, but Cloudflare itself is experiencing a regional or global network issue. 
        * You can set up alerts to know if a Cloudflare outage is affecting your visitors.
        * How to enable it
          - Go to Notifications in your dashboard
          - Click Add and select Incident Alerts
          - Name the alert, leave the component filters blank to monitor everything, add your email address, and click Save. 
