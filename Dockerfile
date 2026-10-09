# Build stage
FROM maven:3.9.6-eclipse-temurin-17-alpine AS build
WORKDIR /app

# Copy pom.xml and source code
COPY backend/pom.xml .
COPY backend/src ./src

# Build production jar
RUN mvn clean package -DskipTests

# Runtime stage
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Copy packaged jar from build stage
COPY --from=build /app/target/backend-0.0.1-SNAPSHOT.jar app.jar

# Expose default port
EXPOSE 8081

# Run Spring Boot application
ENTRYPOINT ["java", "-Dserver.port=${PORT:-8081}", "-jar", "app.jar"]
