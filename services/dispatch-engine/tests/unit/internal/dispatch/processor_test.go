package dispatch_test

import (
	"context"
	"encoding/json"
	"errors"
	"testing"

	"github.com/dashroute/dispatch-engine/internal/broker"
	"github.com/dashroute/dispatch-engine/internal/dispatch"
	amqp "github.com/rabbitmq/amqp091-go"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
	"github.com/stretchr/testify/require"
	"go.uber.org/zap"
)

type MockAcknowledger struct {
	Acked   bool
	Nacked  bool
	Requeue bool
}

func (m *MockAcknowledger) Ack(tag uint64, multiple bool) error {
	m.Acked = true
	return nil
}

func (m *MockAcknowledger) Nack(tag uint64, multiple bool, requeue bool) error {
	m.Nacked = true
	m.Requeue = requeue
	return nil
}

func (m *MockAcknowledger) Reject(tag uint64, requeue bool) error {
	return nil
}

type MockBroker struct {
	mock.Mock
}

func (m *MockBroker) PublishEvent(ctx context.Context, routingKey string, envelope broker.EventEnvelope) error {
	args := m.Called(ctx, routingKey, envelope)
	return args.Error(0)
}

func (m *MockBroker) ConsumeOrders(handler func(context.Context, amqp.Delivery)) error {
	args := m.Called(handler)
	return args.Error(0)
}

type MockLocationStore struct {
	mock.Mock
}

func (m *MockLocationStore) SearchNearbyCouriers(ctx context.Context, lon, lat float64, radiusKm float64, count int) ([]string, error) {
	args := m.Called(ctx, lon, lat, radiusKm, count)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).([]string), args.Error(1)
}

func (m *MockLocationStore) GetCourierStatus(ctx context.Context, courierID string) (string, error) {
	args := m.Called(ctx, courierID)
	return args.String(0), args.Error(1)
}

func (m *MockLocationStore) AcquireLock(ctx context.Context, courierID string) (bool, error) {
	args := m.Called(ctx, courierID)
	return args.Bool(0), args.Error(1)
}

// newTestProcessor is a helper that creates a Processor for tests.
// OTel uses a no-op MeterProvider by default in tests, so metrics are no-ops
// and newDispatchMetrics() will never return an error in this context.
func newTestProcessor(t *testing.T, b *MockBroker, r *MockLocationStore) *dispatch.Processor {
	t.Helper()
	processor, err := dispatch.NewProcessor(b, r, zap.NewNop())
	require.NoError(t, err, "NewProcessor should never fail in test environment")
	return processor
}

func createOrderDelivery(mockAck *MockAcknowledger, orderID, customerID string, lon, lat float64) amqp.Delivery {
	payload := broker.OrderCreatedPayload{
		OrderID:     orderID,
		CustomerID:  customerID,
		PickupLon:   lon,
		PickupLat:   lat,
		DeliveryLon: -74.000,
		DeliveryLat: 40.700,
	}

	envelope := broker.EventEnvelope{
		EventID:    "evt-1",
		EventType:  "order.created",
		OccurredAt: "2026-09-17T00:00:00Z",
		Version:    "1.0",
		Producer:   "orders-service",
		Payload:    payload,
	}

	body, _ := json.Marshal(envelope)

	return amqp.Delivery{
		Acknowledger: mockAck,
		Body:         body,
	}
}

func TestProcessor_Start(t *testing.T) {
	mockBroker := new(MockBroker)
	mockRedis := new(MockLocationStore)

	processor := newTestProcessor(t, mockBroker, mockRedis)

	mockBroker.On("ConsumeOrders", mock.Anything).Return(nil)

	err := processor.Start()

	assert.NoError(t, err)
	mockBroker.AssertExpectations(t)
}

func TestProcessor_HandleOrderCreated_HappyPath(t *testing.T) {
	mockBroker := new(MockBroker)
	mockRedis := new(MockLocationStore)

	processor := newTestProcessor(t, mockBroker, mockRedis)

	mockAck := &MockAcknowledger{}
	delivery := createOrderDelivery(mockAck, "ord-100", "cust-1", -74.006, 40.7128)
	ctx := context.Background()

	mockRedis.On("SearchNearbyCouriers", mock.Anything, -74.006, 40.7128, 3.0, 5).
		Return([]string{"courier-1"}, nil)

	mockRedis.On("GetCourierStatus", mock.Anything, "courier-1").
		Return("IDLE", nil)

	mockRedis.On("AcquireLock", mock.Anything, "courier-1").
		Return(true, nil)

	mockBroker.On("PublishEvent", mock.Anything, "delivery.assigned", mock.MatchedBy(func(env broker.EventEnvelope) bool {
		return env.EventType == "delivery.assigned"
	})).Return(nil)

	processor.HandleOrderCreated(ctx, delivery)

	assert.True(t, mockAck.Acked)
	assert.False(t, mockAck.Nacked)
	mockRedis.AssertExpectations(t)
	mockBroker.AssertExpectations(t)
}

func TestProcessor_HandleOrderCreated_SecondCourierAvailable(t *testing.T) {
	mockBroker := new(MockBroker)
	mockRedis := new(MockLocationStore)

	processor := newTestProcessor(t, mockBroker, mockRedis)

	mockAck := &MockAcknowledger{}
	delivery := createOrderDelivery(mockAck, "ord-101", "cust-1", -74.006, 40.7128)
	ctx := context.Background()

	mockRedis.On("SearchNearbyCouriers", mock.Anything, -74.006, 40.7128, 3.0, 5).
		Return([]string{"courier-busy", "courier-idle"}, nil)

	mockRedis.On("GetCourierStatus", mock.Anything, "courier-busy").
		Return("BUSY", nil)

	mockRedis.On("GetCourierStatus", mock.Anything, "courier-idle").
		Return("IDLE", nil)

	mockRedis.On("AcquireLock", mock.Anything, "courier-idle").
		Return(true, nil)

	mockBroker.On("PublishEvent", mock.Anything, "delivery.assigned", mock.MatchedBy(func(env broker.EventEnvelope) bool {
		if payload, ok := env.Payload.(broker.DeliveryAssignedPayload); ok {
			return payload.CourierID == "courier-idle"
		}
		return false
	})).Return(nil)

	processor.HandleOrderCreated(ctx, delivery)

	assert.True(t, mockAck.Acked)
	assert.False(t, mockAck.Nacked)
	mockRedis.AssertExpectations(t)
	mockBroker.AssertExpectations(t)
}

func TestProcessor_HandleOrderCreated_FailFast_NoCouriers(t *testing.T) {
	mockBroker := new(MockBroker)
	mockRedis := new(MockLocationStore)

	processor := newTestProcessor(t, mockBroker, mockRedis)

	mockAck := &MockAcknowledger{}
	delivery := createOrderDelivery(mockAck, "ord-102", "cust-1", -74.006, 40.7128)
	ctx := context.Background()

	mockRedis.On("SearchNearbyCouriers", mock.Anything, -74.006, 40.7128, 3.0, 5).
		Return([]string{}, nil)

	mockBroker.On("PublishEvent", mock.Anything, "order.dispatch_failed", mock.MatchedBy(func(env broker.EventEnvelope) bool {
		if payload, ok := env.Payload.(broker.OrderDispatchFailedPayload); ok {
			return payload.OrderID == "ord-102" && payload.Reason == "NO_COURIERS_AVAILABLE"
		}
		return false
	})).Return(nil)

	processor.HandleOrderCreated(ctx, delivery)

	assert.True(t, mockAck.Acked)
	assert.False(t, mockAck.Nacked)
	mockRedis.AssertExpectations(t)
	mockBroker.AssertExpectations(t)
}

func TestProcessor_HandleOrderCreated_FailFast_AllCouriersBusy(t *testing.T) {
	mockBroker := new(MockBroker)
	mockRedis := new(MockLocationStore)

	processor := newTestProcessor(t, mockBroker, mockRedis)

	mockAck := &MockAcknowledger{}
	delivery := createOrderDelivery(mockAck, "ord-103", "cust-1", -74.006, 40.7128)
	ctx := context.Background()

	mockRedis.On("SearchNearbyCouriers", mock.Anything, -74.006, 40.7128, 3.0, 5).
		Return([]string{"courier-1", "courier-2"}, nil)

	mockRedis.On("GetCourierStatus", mock.Anything, "courier-1").Return("", errors.New("redis error"))

	mockRedis.On("GetCourierStatus", mock.Anything, "courier-2").Return("IDLE", nil)
	mockRedis.On("AcquireLock", mock.Anything, "courier-2").Return(false, errors.New("lock error"))

	mockBroker.On("PublishEvent", mock.Anything, "order.dispatch_failed", mock.MatchedBy(func(env broker.EventEnvelope) bool {
		if payload, ok := env.Payload.(broker.OrderDispatchFailedPayload); ok {
			return payload.OrderID == "ord-103" && payload.Reason == "NO_COURIERS_AVAILABLE"
		}
		return false
	})).Return(nil)

	processor.HandleOrderCreated(ctx, delivery)

	assert.True(t, mockAck.Acked)
	assert.False(t, mockAck.Nacked)
	mockRedis.AssertExpectations(t)
	mockBroker.AssertExpectations(t)
}

func TestProcessor_HandleOrderCreated_PublishEventError(t *testing.T) {
	mockBroker := new(MockBroker)
	mockRedis := new(MockLocationStore)

	processor := newTestProcessor(t, mockBroker, mockRedis)

	mockAck := &MockAcknowledger{}
	delivery := createOrderDelivery(mockAck, "ord-104", "cust-1", -74.006, 40.7128)
	ctx := context.Background()

	mockRedis.On("SearchNearbyCouriers", mock.Anything, -74.006, 40.7128, 3.0, 5).
		Return([]string{"courier-1"}, nil)
	mockRedis.On("GetCourierStatus", mock.Anything, "courier-1").Return("IDLE", nil)
	mockRedis.On("AcquireLock", mock.Anything, "courier-1").Return(true, nil)

	mockBroker.On("PublishEvent", mock.Anything, "delivery.assigned", mock.Anything).
		Return(errors.New("rabbitmq publish failed"))

	processor.HandleOrderCreated(ctx, delivery)

	assert.True(t, mockAck.Acked)
}

func TestProcessor_HandleOrderCreated_SearchError(t *testing.T) {
	mockBroker := new(MockBroker)
	mockRedis := new(MockLocationStore)

	processor := newTestProcessor(t, mockBroker, mockRedis)

	mockAck := &MockAcknowledger{}
	delivery := createOrderDelivery(mockAck, "ord-105", "cust-1", -74.006, 40.7128)
	ctx := context.Background()

	mockRedis.On("SearchNearbyCouriers", mock.Anything, -74.006, 40.7128, 3.0, 5).
		Return(nil, errors.New("redis connection down"))

	processor.HandleOrderCreated(ctx, delivery)

	assert.False(t, mockAck.Acked)
	assert.True(t, mockAck.Nacked)
	assert.False(t, mockAck.Requeue)
}

func TestProcessor_HandleOrderCreated_InvalidPayload(t *testing.T) {
	mockBroker := new(MockBroker)
	mockRedis := new(MockLocationStore)

	processor := newTestProcessor(t, mockBroker, mockRedis)

	mockAck := &MockAcknowledger{}
	delivery := amqp.Delivery{
		Acknowledger: mockAck,
		Body:         []byte(`{invalid-json}`),
	}
	ctx := context.Background()

	processor.HandleOrderCreated(ctx, delivery)

	assert.False(t, mockAck.Acked)
	assert.True(t, mockAck.Nacked)
	assert.False(t, mockAck.Requeue)
}

func TestProcessor_HandleOrderCreated_InvalidInnerPayload(t *testing.T) {
	mockBroker := new(MockBroker)
	mockRedis := new(MockLocationStore)

	processor := newTestProcessor(t, mockBroker, mockRedis)

	envelope := broker.EventEnvelope{
		EventID:   "evt-bad",
		EventType: "order.created",
		Payload:   "invalid-string-payload-not-struct",
	}
	body, _ := json.Marshal(envelope)

	mockAck := &MockAcknowledger{}
	delivery := amqp.Delivery{
		Acknowledger: mockAck,
		Body:         body,
	}
	ctx := context.Background()

	processor.HandleOrderCreated(ctx, delivery)

	assert.False(t, mockAck.Acked)
	assert.True(t, mockAck.Nacked)
	assert.False(t, mockAck.Requeue)
}
