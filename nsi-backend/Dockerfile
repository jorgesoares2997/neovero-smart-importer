# Estágio de Build
FROM eclipse-temurin:21-jdk-alpine AS build
WORKDIR /workspace/app

# Copia os arquivos do maven wrapper
COPY mvnw .
COPY .mvn .mvn
COPY pom.xml .

# Dá permissão de execução ao wrapper
RUN chmod +x mvnw

# Baixa as dependências offline
RUN ./mvnw dependency:go-offline

# Copia o código fonte e compila
COPY src src
RUN ./mvnw clean package -DskipTests

# Estágio de Execução
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=build /workspace/app/target/*.jar app.jar

# Define a porta que o Render vai escutar
EXPOSE 8080

# Comando para rodar a aplicação
ENTRYPOINT ["java", "-jar", "app.jar"]
