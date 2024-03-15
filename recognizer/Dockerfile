# Usa la imagen oficial de Node como base
FROM node:18-alpine AS build

# Establece el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copia los archivos package.json y package-lock.json para instalar dependencias
COPY package*.json ./

# Instala las dependencias
RUN npm install

# Copia el resto de los archivos de la aplicación
COPY . .

# Construye la aplicación
RUN npm run build 

# Etapa de producción
FROM nginx:alpine

# Copia los archivos de construcción de la etapa anterior al directorio de trabajo de Nginx
COPY --from=build /app/dist/recognizer/browser/ /usr/share/nginx/html/

# Copia la configuración personalizada de Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expone el puerto 80
EXPOSE 80

# Comando para iniciar Nginx en primer plano
CMD ["nginx", "-g", "daemon off;"]
