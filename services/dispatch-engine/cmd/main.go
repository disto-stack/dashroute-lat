package main

import (
	"context"
	"log"
	"os"
	"os/signal"
	"path/filepath"
	"syscall"

	"github.com/joho/godotenv"
	"go.opentelemetry.io/contrib/bridges/otelzap"
	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"

	"github.com/dashroute/dispatch-engine/internal/broker"
	"github.com/dashroute/dispatch-engine/internal/config"
	"github.com/dashroute/dispatch-engine/internal/dispatch"
	"github.com/dashroute/dispatch-engine/internal/redis"
	"github.com/dashroute/dispatch-engine/internal/telemetry"
)

func main() {
	if err := godotenv.Load(filepath.Join("..", "..", ".env")); err != nil {
		log.Println("No root .env file found, falling back to OS environment variables")
	}

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
	shutdown, err := telemetry.InitProvider(ctx, "dispatch-engine", otelEndpoint)
	if err != nil {
		logger.Fatal("Failed to initialize OpenTelemetry", zap.Error(err))
	}
	defer func() {
		if err := shutdown(ctx); err != nil {
			logger.Error("Failed to shutdown OTel providers", zap.Error(err))
		}
	}()

	otelCore := otelzap.NewCore("dispatch-engine")
	logger = logger.WithOptions(zap.WrapCore(func(existing zapcore.Core) zapcore.Core {
		return zapcore.NewTee(existing, otelCore)
	}))
	logger.Info("OTel providers initialized", zap.String("endpoint", otelEndpoint))

	cfg := config.LoadConfig(logger)

	redisClient := redis.NewRedisClient(cfg.RedisURL, logger)
	defer redisClient.Close()

	brokerClient := broker.NewBroker(cfg.RabbitMQURL, logger)
	defer brokerClient.Close()

	processor, err := dispatch.NewProcessor(brokerClient, redisClient, logger)
	if err != nil {
		logger.Fatal("Failed to initialize dispatch processor metrics", zap.Error(err))
	}

	if err := processor.Start(); err != nil {
		logger.Fatal("Failed to start dispatch processor", zap.Error(err))
	}

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	logger.Info("Shutting down Dispatch Engine gracefully...")
}
