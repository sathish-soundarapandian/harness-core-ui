FROM registry.access.redhat.com/ubi8/ubi-minimal:8.6-854

RUN microdnf install nginx

COPY dist /opt/nextgenui
COPY docker/entrypoint.sh /opt/
COPY docker/nginx.conf /etc/nginx/
COPY docker/nginx-ipv6-only.conf /etc/nginx/

WORKDIR /opt/nextgenui

RUN chown 65534:65534 -R /opt/nextgenui
RUN chown 65534:65534 -R /var/log/nginx
RUN chown 65534:65534 -R /tmp
USER 65534

# RUN addgroup -S 101 && adduser -S 101 -G 101
# RUN chown -R 101:101 /opt/ /tmp
# RUN chmod 700 -R /opt
# RUN chmod 700 -R /tmp
# USER 101

EXPOSE 8080
ENTRYPOINT ["sh", "/opt/entrypoint.sh"]
