#!/bin/bash
# Copyright 2022 Harness Inc. All rights reserved.
# Use of this source code is governed by the PolyForm Shield 1.0.0 license
# that can be found in the licenses directory at the root of this repository, also available at
# https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.

# start nginx
nginx -c /opt/cypress/docker/nginx.conf

# reference https://docs.cypress.io/guides/continuous-integration/introduction#Xvfb
Xvfb -screen 0 1024x768x24 :8099 &

# start the mock node server
node /opt/cypress/server.js
