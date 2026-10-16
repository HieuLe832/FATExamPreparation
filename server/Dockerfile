# Backend image only. The frontend is not built here: whatever is in wwwroot/ at build time is served.
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY FatGuide.csproj .
RUN dotnet restore
COPY . .
RUN dotnet publish -c Release -o /app --no-restore -p:SkipClientBuild=true

FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY --from=build /app .
ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080
USER app
ENTRYPOINT ["dotnet", "FatGuide.dll"]
