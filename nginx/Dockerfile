FROM nginx:alpine

# Elimina el archivo de configuración predeterminado de NGINX
RUN rm /etc/nginx/conf.d/default.conf

# Copia tu archivo de configuración personalizado a la ubicación del archivo de configuración de NGINX
COPY nginx.conf /etc/nginx/conf.d/

# Exponer puertos
EXPOSE 80
