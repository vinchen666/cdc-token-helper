# cdc-token-helper-web


## run locally
This project is native html project, so you can run it with any http server, here we use node http-server as a example

1. install npm package `http-server` in your local, with below commands:

   `npm install -g http-server`

2. clone this project to your local
3. go to project root folder: `cd cdc-token-helper-web`
4. run below command to start the server: `http-server -p 9999`, you can change 99999 to any port you want
5. open http://localhost:9999 in browser
6. you can get token for our demo/MET environments, or get token for your local by select `custom` as the environment, and input the occ api url for /basesites of your local or any other environments