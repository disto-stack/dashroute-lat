package redis

import (
	"context"
	"fmt"
	"time"

	"github.com/redis/go-redis/v9"
	"go.uber.org/zap"
)

type Client struct {
	db     *redis.Client
	logger *zap.Logger
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
	}
}

func (c *Client) Close() error {
	return c.db.Close()
}

func (c *Client) UpdateLocation(ctx context.Context, courierID string, lon, lat float64) error {
	err := c.db.GeoAdd(ctx, "couriers:locations", &redis.GeoLocation{
		Name:      courierID,
		Longitude: lon,
		Latitude:  lat,
	}).Err()

	if err != nil {
		c.logger.Error("Failed to update location", zap.Error(err))
		return err
	}
	return nil
}

func (c *Client) UpdateStatus(ctx context.Context, courierID string, status string) error {
	key := fmt.Sprintf("courier:status:%s", courierID)
	err := c.db.HSet(ctx, key, "status", status).Err()
	if err != nil {
		c.logger.Error("Failed to update status", zap.Error(err))
		return err
	}
	return nil
}

func (c *Client) Heartbeat(ctx context.Context, courierID string) error {
	key := fmt.Sprintf("courier:heartbeat:%s", courierID)
	err := c.db.Set(ctx, key, "1", 30*time.Second).Err()
	if err != nil {
		c.logger.Error("Failed to set heartbeat", zap.Error(err))
		return err
	}
	return nil
}
