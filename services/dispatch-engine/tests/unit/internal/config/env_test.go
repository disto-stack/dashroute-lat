package config_test

import (
	"os"
	"testing"

	"github.com/dashroute/dispatch-engine/internal/config"
	"github.com/stretchr/testify/assert"
	"go.uber.org/zap"
)

func TestLoadConfig(t *testing.T) {
	os.Setenv("RABBITMQ_URL", "amqp://test:test@localhost:5672/")
	os.Setenv("REDIS_URL", "redis://localhost:6379/1")
	defer os.Unsetenv("RABBITMQ_URL")
	defer os.Unsetenv("REDIS_URL")

	logger := zap.NewNop()
	cfg := config.LoadConfig(logger)

	assert.Equal(t, "amqp://test:test@localhost:5672/", cfg.RabbitMQURL)
	assert.Equal(t, "redis://localhost:6379/1", cfg.RedisURL)
}
