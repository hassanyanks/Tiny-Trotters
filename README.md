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
  ## Releases/Deployments
    - Deployment steps
      -- merge GitHub branch to main
      -- create GitHub release from main and download release zip file
      -- copy currently running release (C:\tiny-trotters\ponies) to C:\tiny-trotters\previous, 
         replacing any and all contents if that directory exists
      -- replace current copy of c:\tiny-trotters\backup\.env with c:\tiny-trotters\ponies\.env
      -- extract zip file contents to c:\tiny-trotters\current folder
      -- copy c:\tiny-trotters\current\ponies (recursive) to c:\tiny-trotters, forcing to replace current ponies directory and contents
      -- !!!!!!!!!!!ALWAYS ensure  c:\\tiny-trotters\ponies\.env has this entry:  NODE_ENV=production!!!!!!!!!!!!!
      -- FALLBACK
        --- replace newly copied c:\tiny-trotters\ponies with c:\tiny-trotters\current\ponies
  ## Testing
    - Parent Directory:  ponies/test
      -- start test:  dynamicTestRunner.rb
        -- dependencies
          --- DynamicTestRunner.rb
          --- yaml files in features/support/yaml directory
