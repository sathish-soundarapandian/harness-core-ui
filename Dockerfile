FROM registry.access.redhat.com/ubi8/ubi-minimal:8.6-854

RUN microdnf install nginx

COPY dist /opt/nextgenui
COPY docker/entrypoint.sh /opt/
COPY docker/nginx.conf /etc/nginx/
COPY docker/nginx-ipv6-only.conf /etc/nginx/
WORKDIR /opt/nextgenui

RUN chmod +x -R /opt/nextgenui
RUN chmod +x -R /tmp


EXPOSE 8080
ENTRYPOINT ["sh", "/opt/entrypoint.sh"]
