FROM nginx:alpine

# Configuração explícita para Easypanel/Traefik (porta 80)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copia apenas arquivos do site (evita .git e nginx.conf duplicado no html)
COPY index.html /usr/share/nginx/html/
COPY css /usr/share/nginx/html/css
COPY js /usr/share/nginx/html/js
COPY img /usr/share/nginx/html/img

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]