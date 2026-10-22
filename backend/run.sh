#!/bin/sh
cd "$(dirname "$0")" && mvn spring-boot:run -Dspring-boot.run.profiles=local
