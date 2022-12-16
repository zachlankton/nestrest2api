FROM public.ecr.aws/docker/library/node:16

WORKDIR /api-server

COPY . .

RUN npm ci
RUN npm run build
RUN npx prisma generate

ENV SERVER_PORT=80

ENV DATABASE_URL="postgresql://nestrest2admin:mysecretpassword@localhost:5432/nestrest2test?schema=public"
ENV DEBUG=true
ENV SESSION_SECRET_KEY="98fQTDh2uNSRVjrRxFn5V4WgPP99QawUkLHqoDdBFHBXQi3Z"

# Encryption key needs to be 32 chars long
ENV ENCRYPTION_KEY="ZydMYrVB9JPFGM3NMhcjeX9eciSoStw3"

EXPOSE 80

RUN chmod +x /api-server/startProduction.sh
RUN chown root:root startProduction.sh

CMD /api-server/startProduction.sh