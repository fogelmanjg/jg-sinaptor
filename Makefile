COMPOSE = docker compose

.PHONY: help up down logs restart status list-topics clean

help:
	@echo "jg-sinaptor — Bus de Eventos"
	@echo ""
	@echo "  Puertos: frontend=9050  backend=9052  akhq=9053  mongo=9056  kafka=9058"
	@echo ""
	@echo "  make up           Levantar todos los servicios"
	@echo "  make down         Detener servicios"
	@echo "  make logs         Ver logs"
	@echo "  make restart      Reiniciar servicios"
	@echo "  make status       Estado de los contenedores"
	@echo "  make list-topics  Listar topics de Kafka"
	@echo "  make clean        Detener y borrar volúmenes de datos"

up:
	@cp -n .env.example .env 2>/dev/null && echo ".env creado desde .env.example" || true
	@mkdir -p data/mongodb data/kafka
	$(COMPOSE) up -d
	@echo "jg-sinaptor levantado"

down:
	$(COMPOSE) down --remove-orphans

logs:
	$(COMPOSE) logs -f

restart:
	$(COMPOSE) restart

status:
	$(COMPOSE) ps

list-topics:
	$(COMPOSE) exec -T kafka /opt/kafka/bin/kafka-topics.sh --bootstrap-server localhost:9092 --list

clean:
	@read -p "Esto borra los datos. ¿Continuar? [s/N]: " c; \
	[ "$$c" = "s" ] || [ "$$c" = "S" ] && \
		$(COMPOSE) down -v --remove-orphans && rm -rf data/mongodb data/kafka && echo "Limpio" || echo "Cancelado"
