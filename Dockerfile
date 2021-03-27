FROM node:14.16.0-alpine3.12

ENV NODE_ENV production

RUN apk update \
    && apk add git \
    && apk add strace

RUN git clone --single-branch --branch node https://github.com/MrAngus666/airnode.git
WORKDIR /airnode

RUN cat package.json
RUN npm install -g ts-node
RUN yarn add dotenv

RUN yarn run bootstrap
RUN yarn run build

RUN echo '*/1 * * * * cd /airnode && yarn run dev:invoke' > local-cron
RUN /usr/bin/crontab /airnode/local-cron

HEALTHCHECK --interval=5m --timeout=2m \
    CMD (strace -p $(pgrep crond) -s9999 -o cronLog.txt) & sleep 70 ; kill $! \
        && cat cronLog.txt | grep crond > /dev/null; if [ 0 != $? ]; then kill 1; fi && rm cronLog.txt

CMD cp out/config.json /airnode/packages/node/__dev__/config.json | true \
    && cp out/.env /airnode/packages/node/__dev__/.env | true \
    && /usr/sbin/crond -f -l 8
