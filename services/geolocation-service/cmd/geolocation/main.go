package main

import (
	"context"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"dashroute-lat/services/geolocation-service/internal/auth"
	"dashroute-lat/services/geolocation-service/internal/redis"
	"dashroute-lat/services/geolocation-service/internal/server"
	"dashroute-lat/services/geolocation-service/internal/telemetry"

	"github.com/joho/godotenv"
	"go.opentelemetry.io/contrib/bridges/otelzap"
	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
)

func main() {
	logger, _ := zap.NewProduction()
	defer logger.Sync()

	logger.Info("Starting Geolocation Service...")

	_ = godotenv.Load("../../.env")

	redisURL := os.Getenv("REDIS_URL")
	if redisURL == "" {
		redisURL = "redis://localhost:6379/0"
	}

	jwtSecret := os.Getenv("JWT_SECRET")
	if jwtSecret == "" {
		logger.Fatal("JWT_SECRET environment variable is required")
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "4003"
	}

	otelEndpoint := os.Getenv("OTEL_EXPORTER_OTLP_ENDPOINT")
	if otelEndpoint == "" {
		otelEndpoint = "http://localhost:4317"
	}

	ctxInit := context.Background()
	shutdownOTel, err := telemetry.InitProvider(ctxInit, "geolocation-service", otelEndpoint)
	if err != nil {
		logger.Fatal("Failed to initialize OpenTelemetry", zap.Error(err))
	}
	defer func() {
		if err := shutdownOTel(context.Background()); err != nil {
			logger.Error("Failed to shutdown OTel cleanly", zap.Error(err))
		}
	}()

	otelCore := otelzap.NewCore("geolocation-service")
	logger = logger.WithOptions(zap.WrapCore(func(existing zapcore.Core) zapcore.Core {
		return zapcore.NewTee(existing, otelCore)
	}))
	logger.Info("OTel providers initialized", zap.String("endpoint", otelEndpoint))

	redisClient := redis.NewRedisClient(redisURL, logger)
	defer redisClient.Close()

	metrics, err := server.NewMetrics()
	if err != nil {
		logger.Fatal("Failed to initialize metrics", zap.Error(err))
	}

	jwtValidator := auth.NewValidator(jwtSecret)
	wsServer := server.NewServer(redisClient, jwtValidator, metrics, logger)

	mux := http.NewServeMux()
	mux.HandleFunc("/ws", wsServer.HandleWebSocket)
	mux.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("OK"))
	})

	srv := &http.Server{
		Addr:    ":" + port,
		Handler: mux,
	}

	go func() {
		logger.Info("Listening on port " + port)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			logger.Fatal("Failed to start server", zap.Error(err))
		}
	}()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit
	logger.Info("Shutting down server...")

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := srv.Shutdown(ctx); err != nil {
		logger.Fatal("Server forced to shutdown", zap.Error(err))
	}

	logger.Info("Server exiting")
}
