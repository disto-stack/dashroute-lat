package main

import (
	"context"
	"log"
	"os"
	"os/signal"
	"syscall"

	"go.uber.org/zap"

	"github.com/dashroute/dispatch-engine/internal/broker"
	"github.com/dashroute/dispatch-engine/internal/config"
	"github.com/dashroute/dispatch-engine/internal/dispatch"
	"github.com/dashroute/dispatch-engine/internal/redis"
	"github.com/dashroute/dispatch-engine/internal/telemetry"
)

func main() {
	rawLogger, err := zap.NewProduction()
	if err != nil {
		log.Fatalf("Failed to initialize zap logger: %v", err)
	}
	defer rawLogger.Sync()

	logger := rawLogger.With(
		zap.String("serviceName", "dispatch-engine"),
		zap.String("environment", os.Getenv("NODE_ENV")),
	)

	logger.Info("Initializing Dispatch Engine...")

	ctx := context.Background()

	otelEndpoint := os.Getenv("OTEL_EXPORTER_OTLP_ENDPOINT")
	tp, err := telemetry.InitProvider(ctx, "dispatch-engine", otelEndpoint)
	if err != nil {
		logger.Fatal("Failed to initialize OpenTelemetry", zap.Error(err))
	}
	defer func() {
		if err := tp.Shutdown(ctx); err != nil {
			logger.Error("Failed to shutdown TracerProvider", zap.Error(err))
		}
	}()

	cfg := config.LoadConfig(logger)

	redisClient := redis.NewRedisClient(cfg.RedisURL, logger)
	defer redisClient.Close()

	brokerClient := broker.NewBroker(cfg.RabbitMQURL, logger)
	defer brokerClient.Close()

	processor := dispatch.NewProcessor(brokerClient, redisClient, logger)
	if err := processor.Start(); err != nil {
		logger.Fatal("Failed to start dispatch processor", zap.Error(err))
	}

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	logger.Info("Shutting down Dispatch Engine gracefully...")
}
