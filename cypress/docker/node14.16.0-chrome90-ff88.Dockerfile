# This image will be saved on GCR:
# us.gcr.io/platform-205701/base-image/ng-ui-cypress-base-image:node14.16.0-chrome90-ff88
FROM cypress/browsers:node14.16.0-chrome90-ff88

WORKDIR /opt/cypress

RUN apt-get --allow-releaseinfo-change update

# nginx is required to run a reverse proxy
RUN apt-get install -y nginx jq

# Reference: https://docs.cypress.io/guides/continuous-integration/introduction#Dependencies
# RUN apt-get install libgtk2.0-0 libgtk-3-0 libgbm-dev libnotify-dev libgconf-2-4 libnss3 libxss1 libasound2 libxtst6 xauth xvfb


# install node_modules in order to cache them
COPY cypress/package.json .
COPY cypress/yarn.lock .
RUN yarn install

# generate certificates
RUN mkdir -p /opt/certificates
RUN openssl req -x509 -newkey rsa:4096 -keyout /opt/certificates/localhost-key.pem -out /opt/certificates/localhost.pem -days 365 -nodes -subj '/C=US'

