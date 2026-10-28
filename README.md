# Tiny-Trotters
  ##  Overview
    - Docker in Windows running node.js, Redis, Cloudflare Tunnel containers
      -- spins up at system startup with auto-user login set in Windows registry
    - database:  MongoDB
    - email support:  Mailgun by Sinch free tier
  ##  Production Environment
    - tiny-trotters:  startup/config files
      - ponies:  node.js code
      - bin:  miscellaneous utility scripts, virtually all deprecated at this writing but kept for prosperity
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
