# Utiliza una imagen base de Ubuntu
FROM ubuntu:20.04
# Establece variables de entorno para evitar preguntas interactivas
ENV DEBIAN_FRONTEND=noninteractive
ENV TZ=UTC
# Actualiza los repositorios e instala las dependencias necesarias
RUN apt-get update && apt-get install -y libopencv-dev libtesseract-dev git cmake build-essential libleptonica-dev liblog4cplus-dev libcurl3-dev nodejs npm

# Clona el repositorio de Phantom
COPY ./Phantom /Phantom

# Prepara el directorio de compilación
WORKDIR /Phantom/src
WORKDIR /Phantom/src/build
# Compila Phantom
RUN cmake -DCMAKE_INSTALL_PREFIX:PATH=/usr -DCMAKE_INSTALL_SYSCONFDIR:PATH=/etc ..
RUN make
RUN make install

# Copia la API de Node.js Express al directorio /api en la imagen
COPY ./api /api

# Instala las dependencias de la API de Node.js Express
WORKDIR /api
RUN npm install

# Expone el puerto en el que tu API de Node.js Express escucha las solicitudes
EXPOSE 80

# Comando para ejecutar tu API de Node.js Express
CMD ["npm", "start"]