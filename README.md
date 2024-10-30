# WeatherGuardian


Install Nginx 

`sudo apt update`
`sudo apt install nginx`
start nginx server
`sudo systemctl start nginx`
autostart nginx server on boot
`sudo systemctl enable nginx`
check status
`sudo systemctl status nginx`
Output shall be: 
● nginx.service - A high performance web server and a reverse proxy server
     Loaded: loaded (/lib/systemd/system/nginx.service; enabled)
     Active: active (running)
To restart nginx:
`sudo systemctl restart nginx`
Test configurationfile
`sudo nginx -t`
if the firewall makes stuff
`sudo ufw allow 2292`


Setup Nginx Server

Nginx configuration File (nginx.conf)
```
user www-data;
worker_processes auto;
pid /run/nginx.pid;
error_log /var/log/nginx/error.log;
include /etc/nginx/modules-enabled/*.conf;

events {
    worker_connections 768;
    # multi_accept on;
}

http {
    include mime.types;

    server {
        listen 2292; #define port of webserver
        root /var/html/dist/web/browser;

        # Optionally, define an index file (like index.html)
        index index.html;

        # Add additional configuration, like handling 404 errors if necessary
        location / {
            try_files $uri $uri/ =404;
        }
    }
}
```

copy angular build file to nginx location
`cp -r [path_to_dist_folder] var/www/html/`


Setup automatic start aufter boot of the DB Server

dbserver.service
```
[Unit]
Description=Start Database Server via JavaScript
After=network.target

[Service]
ExecStart=/home/benji/.nvm/versions/node/v22.9.0/bin/node /home/benji/git/WeatherGuardian/web/start-db.js
WorkingDirectory=/home/benji/git/WeatherGuardian/web
Restart=always
User=benji
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

enable dbserver.service
`sudo systemctl enable dbserver.service`
check if enabling is succeed
`systemctl is-enabled dbserver.service`
output shall be "enabled"
reboot rp
`sudo reboot`
check status of db server
`sudo systemctl status dbserver.service`