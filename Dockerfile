FROM node:10
WORKDIR /home/node/app

RUN yarn global add nodemon grunt-cli bower gulp npm-run-all

ADD package.json .
RUN yarn install --silent --non-interactive --production=false

ADD bower.json .bowerrc ./
RUN bower install --silent --allow-root

ADD . .
RUN grunt > /dev/null

RUN mkdir -p public/resources   && chown node:node public/resources \
 && mkdir -p public/pa          && chown node:node public/pa \
 && mkdir -p public/img/courses && chown node:node public/img/courses

ENV NODE_ENV=production
ENV DATABASE=mongodb/course_mapper
ENV PORT=3000
EXPOSE 3000

USER node
CMD ["bin/www"]
