###
# Mainflux Dockerfile
###
# Set the base image to Node, onbuild variant: https://registry.hub.docker.com/_/node/

FROM node:4.2.3
MAINTAINER Mainflux

ENV MAINFLUX_WS_PORT=7899

RUN apt-get update -qq && apt-get install -y build-essential

RUN mkdir -p /mainflux/wsServer

###
# Installations
###
# Add Gulp globally

RUN npm install -g gulp
RUN npm install -g nodemon

# Finally, install all project Node modules
COPY . /mainflux/wsServer
WORKDIR /mainflux/wsServer
RUN npm install

EXPOSE $MAINFLUX_WS_PORT

###
# Run main command from entrypoint and parameters in CMD[]
###

CMD [""]

# Set default container command
ENTRYPOINT gulp
