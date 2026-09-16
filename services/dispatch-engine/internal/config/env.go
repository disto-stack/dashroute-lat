package config

import (
	"fmt"
	"net/url"
	"os"
	"path/filepath"

	"github.com/joho/godotenv"
	"go.uber.org/zap"
)

type Config struct {
	RabbitMQURL string
	RedisURL    string
}

func LoadConfig(logger *zap.Logger) *Config {
	envPath := filepath.Join("..", "..", ".env")
	err := godotenv.Load(envPath)
	if err != nil {
		logger.Info("No .env file found at root, falling back to OS environment variables")
	}

	rabbitURL := os.Getenv("RABBITMQ_URL")
	if rabbitURL == "" {
		user := getEnv("RABBITMQ_USER", "guest")
		pass := getEnv("RABBITMQ_PASS", "guest")
		host := getEnv("RABBITMQ_HOST", "localhost")
		port := getEnv("RABBITMQ_PORT", "5672")

		userInfo := url.UserPassword(user, pass).String()
		rabbitURL = fmt.Sprintf("amqp://%s@%s:%s/", userInfo, host, port)
	}

	return &Config{
		RabbitMQURL: rabbitURL,
		RedisURL:    getEnv("REDIS_URL", "redis://localhost:6379/0"),
	}
}

func getEnv(key, fallback string) string {
	if value, exists := os.LookupEnv(key); exists && value != "" {
		return value
	}
	return fallback
}

