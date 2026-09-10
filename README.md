# Tiny-Trotters
## Manual Failover
  ### Pre-requisites:  Cloudflare, Hostinger, and Render configuration
    - To ensure your manual failover works smoothly on the free tier, complete these setup steps:
        - Pre-register the Domain on Both Services (The Trick)
          - To bypass Render's single-domain restriction, you can trick the system using a slight variation  
            - Go to your Production Service -> Custom Domains, and add yourdomain.com.
            - Go to your Staging Service -> Custom Domains, and add a backup variant like ://yourdomain.com (or vice versa). 
              - This forces Render to issue and validate SSL certificates for both services ahead of time
  ### Manual Failover Steps
    - What to do during an Emergency (The 2-Step Protocol)
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
