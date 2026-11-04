# Tiny-Trotters
  ##  Overview
    - Docker in Windows running node.js, Redis, Cloudflare Tunnel containers
      -- spins up at system startup with auto-user login set in Windows registry
    - database:  MongoDB
    - email support:  Mailgun by Sinch free tier
  ##  Production Environment
    - directory structure
      - tiny-trotters
        -- ponies:  node.js code
          --- deploy
            ---- docker-compose.yml
            ---- Dockerfile
            ---- start-docker.bat
        -- backup:  
          --- copy of .env
        -- previous
          --- previous release source files
    - DockerComposeOnBoot Windows Scheduled Task
      -- runs c:/tiny-trotters/ponies/deploy/start-docker.bat at system startup
  ##  Development Environment
    - Parent Directory:  JavaScriptApps/sydney_ponies
    - Application: Visual Studio Code
  ## Release and Deployment
    - Steps
      -- merge GitHub branch to main
      -- create GitHub release from main and download release zip file
      -- replace C:\tiny-trotters\previous\ponies with currently running release C:\tiny-trotters\ponies 
      -- extract zip file contents to c:\tiny-trotters\current folder
      -- replace c:\tiny-trotters\ponies with c:\tiny-trotters\current\ponies
      -- .env file
        --- if .env has changed:  copy from dev environment to C:\tiny-trotters\ponies
        --- if .env has not changed: copy .env from C:\tiny-trotters\previous\ponies
        --- !!!!!!!!!!!ALWAYS ensure NODE_ENV is in c:\tiny-trotters\ponies\.env and is set to:  production
      -- restart computer to trigger DockerComposeOnBoot Windows Scheduled Task 
      -- FALLBACK
        --- replace newly copied c:\tiny-trotters\ponies with c:\tiny-trotters\previous\ponies
        --- restart computer to trigger DockerComposeOnBoot Windows Scheduled Task
  ## Testing
    - Parent Directory:  ponies/test
      -- start test:  dynamicTestRunner.rb
        -- dependencies
          --- DynamicTestRunner.rb
          --- yaml files in features/support/yaml directory
