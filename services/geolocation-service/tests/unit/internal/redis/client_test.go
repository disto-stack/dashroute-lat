package redis_test

import (
	"context"
	"testing"
	"time"

	"github.com/alicebob/miniredis/v2"
	goredis "github.com/redis/go-redis/v9"
	"github.com/stretchr/testify/assert"
	"go.uber.org/zap"

	"dashroute-lat/services/geolocation-service/internal/redis"
)

func setupTestRedis(t *testing.T) (*miniredis.Miniredis, *redis.Client, *zap.Logger) {
	s := miniredis.RunT(t)
	logger, _ := zap.NewDevelopment()

	db := goredis.NewClient(&goredis.Options{
		Addr: s.Addr(),
	})

	client := redis.NewClientWithDB(db, logger)
	return s, client, logger
}

func TestUpdateLocation(t *testing.T) {
	s, client, _ := setupTestRedis(t)
	defer s.Close()
	defer client.Close()

	ctx := context.Background()
	err := client.UpdateLocation(ctx, "courier-123", -74.006, 40.7128)
	assert.NoError(t, err)

	res, err := s.ZScore("couriers:locations", "courier-123")
	assert.NoError(t, err)
	assert.NotZero(t, res)
}

func TestUpdateStatus(t *testing.T) {
	s, client, _ := setupTestRedis(t)
	defer s.Close()
	defer client.Close()

	ctx := context.Background()
	err := client.UpdateStatus(ctx, "courier-123", "ONLINE")
	assert.NoError(t, err)

	status := s.HGet("courier:status:courier-123", "status")
	assert.Equal(t, "ONLINE", status)
}

func TestHeartbeat(t *testing.T) {
	s, client, _ := setupTestRedis(t)
	defer s.Close()
	defer client.Close()

	ctx := context.Background()
	err := client.Heartbeat(ctx, "courier-123")
	assert.NoError(t, err)

	val, err := s.Get("courier:heartbeat:courier-123")
	assert.NoError(t, err)
	assert.Equal(t, "1", val)

	ttl := s.TTL("courier:heartbeat:courier-123")
	assert.True(t, ttl > 0 && ttl <= 30*time.Second)
}
