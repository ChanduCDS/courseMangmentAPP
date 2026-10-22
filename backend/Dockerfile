# Build stage: Java 21 + Maven; the local command can remain `mvn spring-boot:run`.
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn -B clean package -DskipTests \
 && JAR="$(find target -maxdepth 1 -type f -name '*.jar' ! -name '*.original' | head -n 1)" \
 && test -n "$JAR" \
 && cp "$JAR" /app/app.jar

# Runtime stage
FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /app/app.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
