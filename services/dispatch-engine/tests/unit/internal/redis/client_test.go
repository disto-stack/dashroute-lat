package redis_test

import (
	"context"
	"errors"
	"testing"
	"time"

	"github.com/dashroute/dispatch-engine/internal/redis"
	redismock "github.com/go-redis/redismock/v9"
	redisv9 "github.com/redis/go-redis/v9"
	"github.com/stretchr/testify/assert"
	"go.uber.org/zap"
)

func TestSearchNearbyCouriers(t *testing.T) {
	db, mock := redismock.NewClientMock()
	logger := zap.NewNop()
	client := redis.NewClientWithDB(db, logger)

	ctx := context.Background()

	mock.ExpectGeoSearch("couriers:locations", &redisv9.GeoSearchQuery{
		Longitude:  -74.006,
		Latitude:   40.7128,
		Radius:     3.0,
		RadiusUnit: "km",
		Sort:       "ASC",
		Count:      5,
	}).SetVal([]string{"courier-1", "courier-2"})

	couriers, err := client.SearchNearbyCouriers(ctx, -74.006, 40.7128, 3.0, 5)

	assert.NoError(t, err)
	assert.Equal(t, []string{"courier-1", "courier-2"}, couriers)
	assert.NoError(t, mock.ExpectationsWereMet())
}

func TestSearchNearbyCouriers_Error(t *testing.T) {
	db, mock := redismock.NewClientMock()
	logger := zap.NewNop()
	client := redis.NewClientWithDB(db, logger)

	ctx := context.Background()

	mock.ExpectGeoSearch("couriers:locations", &redisv9.GeoSearchQuery{
		Longitude:  -74.006,
		Latitude:   40.7128,
		Radius:     3.0,
		RadiusUnit: "km",
		Sort:       "ASC",
		Count:      5,
	}).SetErr(errors.New("redis timeout"))

	couriers, err := client.SearchNearbyCouriers(ctx, -74.006, 40.7128, 3.0, 5)

	assert.Error(t, err)
	assert.Nil(t, couriers)
	assert.NoError(t, mock.ExpectationsWereMet())
}

func TestGetCourierStatus_Found(t *testing.T) {
	db, mock := redismock.NewClientMock()
	logger := zap.NewNop()
	client := redis.NewClientWithDB(db, logger)

	ctx := context.Background()

	mock.ExpectHGet("courier:status:c-1", "status").SetVal("IDLE")

	status, err := client.GetCourierStatus(ctx, "c-1")

	assert.NoError(t, err)
	assert.Equal(t, "IDLE", status)
	assert.NoError(t, mock.ExpectationsWereMet())
}

func TestGetCourierStatus_NilReturnsEmptyString(t *testing.T) {
	db, mock := redismock.NewClientMock()
	logger := zap.NewNop()
	client := redis.NewClientWithDB(db, logger)

	ctx := context.Background()

	mock.ExpectHGet("courier:status:c-unknown", "status").SetErr(redisv9.Nil)

	status, err := client.GetCourierStatus(ctx, "c-unknown")

	assert.NoError(t, err)
	assert.Equal(t, "", status)
	assert.NoError(t, mock.ExpectationsWereMet())
}

func TestGetCourierStatus_Error(t *testing.T) {
	db, mock := redismock.NewClientMock()
	logger := zap.NewNop()
	client := redis.NewClientWithDB(db, logger)

	ctx := context.Background()

	mock.ExpectHGet("courier:status:c-err", "status").SetErr(errors.New("db error"))

	status, err := client.GetCourierStatus(ctx, "c-err")

	assert.Error(t, err)
	assert.Equal(t, "", status)
	assert.NoError(t, mock.ExpectationsWereMet())
}

func TestAcquireLock_Success(t *testing.T) {
	db, mock := redismock.NewClientMock()
	logger := zap.NewNop()
	client := redis.NewClientWithDB(db, logger)

	ctx := context.Background()

	mock.ExpectSetNX("courier:lock:c-1", "BUSY", 30*time.Second).SetVal(true)

	locked, err := client.AcquireLock(ctx, "c-1")

	assert.NoError(t, err)
	assert.True(t, locked)
	assert.NoError(t, mock.ExpectationsWereMet())
}

func TestAcquireLock_Failure(t *testing.T) {
	db, mock := redismock.NewClientMock()
	logger := zap.NewNop()
	client := redis.NewClientWithDB(db, logger)

	ctx := context.Background()

	mock.ExpectSetNX("courier:lock:c-1", "BUSY", 30*time.Second).SetVal(false)

	locked, err := client.AcquireLock(ctx, "c-1")

	assert.NoError(t, err)
	assert.False(t, locked)
	assert.NoError(t, mock.ExpectationsWereMet())
}

func TestAcquireLock_Error(t *testing.T) {
	db, mock := redismock.NewClientMock()
	logger := zap.NewNop()
	client := redis.NewClientWithDB(db, logger)

	ctx := context.Background()

	mock.ExpectSetNX("courier:lock:c-1", "BUSY", 30*time.Second).SetErr(errors.New("lock error"))

	locked, err := client.AcquireLock(ctx, "c-1")

	assert.Error(t, err)
	assert.False(t, locked)
	assert.NoError(t, mock.ExpectationsWereMet())
}

func TestClose(t *testing.T) {
	db, _ := redismock.NewClientMock()
	logger := zap.NewNop()
	client := redis.NewClientWithDB(db, logger)

	err := client.Close()
	assert.NoError(t, err)
}
