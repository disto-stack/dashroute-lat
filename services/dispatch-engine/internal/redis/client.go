package redis

import (
	"context"
	"fmt"
	"time"

	"github.com/redis/go-redis/v9"
	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/trace"
	"go.uber.org/zap"
)

type Client struct {
	db     *redis.Client
	logger *zap.Logger
	tracer trace.Tracer
}

func NewRedisClient(url string, logger *zap.Logger) *Client {
	opts, err := redis.ParseURL(url)
	if err != nil {
		logger.Fatal("Failed to parse Redis URL", zap.Error(err))
	}

	client := redis.NewClient(opts)

	if err := client.Ping(context.Background()).Err(); err != nil {
		logger.Fatal("Failed to connect to Redis", zap.Error(err))
	}

	logger.Info("Connected to Redis successfully")
	return NewClientWithDB(client, logger)
}

func NewClientWithDB(db *redis.Client, logger *zap.Logger) *Client {
	return &Client{
		db:     db,
		logger: logger,
		tracer: otel.Tracer("dispatch-engine/redis"),
	}
}

func (c *Client) Close() error {
	return c.db.Close()
}

func (c *Client) SearchNearbyCouriers(ctx context.Context, lon, lat float64, radiusKm float64, count int) ([]string, error) {
	ctx, span := c.tracer.Start(ctx, "Redis.GEOSEARCH")
	defer span.End()

	res, err := c.db.GeoSearch(ctx, "couriers:locations", &redis.GeoSearchQuery{
		Longitude:  lon,
		Latitude:   lat,
		Radius:     radiusKm,
		RadiusUnit: "km",
		Sort:       "ASC",
		Count:      count,
	}).Result()

	if err != nil {
		span.RecordError(err)
		return nil, err
	}

	return res, nil
}

func (c *Client) GetCourierStatus(ctx context.Context, courierID string) (string, error) {
	ctx, span := c.tracer.Start(ctx, "Redis.HGET")
	defer span.End()

	key := fmt.Sprintf("courier:status:%s", courierID)
	status, err := c.db.HGet(ctx, key, "status").Result()
	if err == redis.Nil {
		return "", nil
	}
	if err != nil {
		span.RecordError(err)
	}
	return status, err
}

func (c *Client) AcquireLock(ctx context.Context, courierID string) (bool, error) {
	ctx, span := c.tracer.Start(ctx, "Redis.SETNX")
	defer span.End()

	key := fmt.Sprintf("courier:lock:%s", courierID)
	locked, err := c.db.SetNX(ctx, key, "BUSY", 30*time.Second).Result()
	if err != nil {
		span.RecordError(err)
	}
	return locked, err
}
