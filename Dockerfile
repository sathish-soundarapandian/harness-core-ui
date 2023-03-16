FROM registry.access.redhat.com/ubi8/ubi-minimal:8.7
RUN microdnf module enable nginx:1.20
RUN microdnf install nginx

# copy dist to serving directory
COPY dist /opt/nextgenui

# copy static files from source to dist
COPY src/static /opt/nextgenui/static

# copy config files & scripts
COPY docker/entrypoint.sh /opt/
COPY docker/nginx.conf /etc/nginx/
COPY docker/nginx-ipv6-only.conf /etc/nginx/

WORKDIR /opt/nextgenui

RUN chown 65534:65534 -R /opt/nextgenui
RUN chown 65534:65534 -R /var/log/nginx

USER 65534

EXPOSE 8080
ENTRYPOINT ["sh", "/opt/entrypoint.sh"]
