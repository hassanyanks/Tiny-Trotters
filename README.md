# Tiny-Trotters
  ##  Overview
    - Docker in Windows running node.js, Redis, Cloudflare Tunnel containers
      -- spins up at system startup with auto-user login set in Windows registry
    - database:  MongoDB
    - email support:  Mailgun by Sinch free tier
  ## Deployment Special Notes
    - if it is changed in development environment, copy updated .env from development environment to 
      production environment project root (ponies directory) AND backup directory (see below) 
    - ALWAYS ensure NODE_ENV is in the production environment .env file (project root directory ponies) and its value
      is set to 'production'!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    - Deployment steps
      -- merge GitHub branch to main
      -- create GitHub release and download release zip file
      -- copy currently running release source files to C:\tiny-trotters\previous, 
         replacing any and all contents if that directory exists
      -- extract all zip file contents into c:\tiny-trotters\next folder (overwrite any existing content)
      -- copy c:\tiny-trotters\next\ponies\deploy contents to c:\tiny-trotters\de
  ##  Production Environment
    - tiny-trotters:  startup/config files
      -- ponies:  node.js code
      -- backup:  
        --- copy of .env
      -- deploy
        --- docker-compose.yml
        --- Dockerfile
        --- start-docker.bat
    - DockerComposeOnBoot Windows Scheduled Task
      -- runs tiny-trotters/start-docker.bat
  ##  Development Environment
    - Parent Directory:  JavaScriptApps/sydney_ponies
    - Application: Visual Studio Code
  ## Testing
    - Parent Directory:  ponies/test
      -- start test:  dynamicTestRunner.rb
        -- dependencies
          --- DynamicTestRunner.rb
          --- yaml files in features/support/yaml directory
