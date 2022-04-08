FROM node:17

COPY . /app
WORKDIR /app

USER 1000:1000

#RUN --mount=type=tmpfs,target=/app/node_modules (yarn install; yarn run build)
ENTRYPOINT yarn run start /state/plugins/oui_plugin
