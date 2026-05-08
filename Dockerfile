FROM nginx:alpine

# Copy all the static HTML/CSS/JS files to Nginx's default public folder
COPY . /usr/share/nginx/html

# Cloud Run defaults to port 8080, but we will explicitly tell it we use 80 during deployment
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
