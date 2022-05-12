FROM us.gcr.io/platform-205701/base-image/ng-ui-cypress-base-image:node14.16.0-chrome90-ff88

WORKDIR /opt/cypress

COPY dist /opt/nextgenui
COPY cypress /opt/cypress
RUN yarn install && yarn cache clean --all

EXPOSE 8181
EXPOSE 8099

ENTRYPOINT ["sh", "/opt/cypress/docker/entrypoint.sh"]
