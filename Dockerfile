FROM node:15.14

LABEL version="1.0"
LABEL description="This is the Spiking Neural Network engine realtime shim.  It passes raw socket requests and API calls between a web client and the engine."
LABEL maintainer = "Louis Ross <louis.ross@gmail.com"

WORKDIR /app

#COPY ["package.json", "package-lock.json", "./"]
#RUN ls
#RUN npm install --production
#RUN npm install

#COPY . .

EXPOSE 4000

CMD ["bash"]
