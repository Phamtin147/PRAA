FROM node:20-alpine AS fe-build
WORKDIR /app
COPY praa-frontend/package*.json ./
RUN npm ci
COPY praa-frontend/ ./
RUN npm run build

FROM maven:3.9-eclipse-temurin-17 AS be-build
WORKDIR /app
COPY praa/pom.xml .
RUN mvn dependency:go-offline -B
COPY praa/src ./src
COPY --from=fe-build /app/dist ./src/main/resources/static/
RUN     mvn clean package -DskipTests

FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=be-build /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT java -jar app.jar