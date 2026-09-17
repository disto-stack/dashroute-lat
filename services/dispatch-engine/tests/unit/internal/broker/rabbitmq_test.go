package broker_test

import (
	"encoding/json"
	"testing"

	"github.com/dashroute/dispatch-engine/internal/broker"
	"github.com/stretchr/testify/assert"
)

func TestEventEnvelope_JSONMarshalling(t *testing.T) {
	payload := broker.OrderCreatedPayload{
		OrderID:     "ord-1",
		CustomerID:  "cust-1",
		PickupLon:   -74.006,
		PickupLat:   40.7128,
		DeliveryLon: -74.000,
		DeliveryLat: 40.700,
	}

	envelope := broker.EventEnvelope{
		EventID:    "evt-100",
		EventType:  "order.created",
		OccurredAt: "2026-09-17T01:00:00Z",
		Version:    "1.0",
		Producer:   "orders-service",
		Payload:    payload,
	}

	bytes, err := json.Marshal(envelope)
	assert.NoError(t, err)

	var unmarshaled broker.EventEnvelope
	err = json.Unmarshal(bytes, &unmarshaled)
	assert.NoError(t, err)
	assert.Equal(t, "evt-100", unmarshaled.EventID)
	assert.Equal(t, "order.created", unmarshaled.EventType)

	payloadBytes, err := json.Marshal(unmarshaled.Payload)
	assert.NoError(t, err)

	var orderPayload broker.OrderCreatedPayload
	err = json.Unmarshal(payloadBytes, &orderPayload)
	assert.NoError(t, err)
	assert.Equal(t, "ord-1", orderPayload.OrderID)
	assert.Equal(t, "cust-1", orderPayload.CustomerID)
	assert.Equal(t, -74.006, orderPayload.PickupLon)
	assert.Equal(t, 40.7128, orderPayload.PickupLat)
}

func TestDeliveryAssignedPayload_JSONMarshalling(t *testing.T) {
	payload := broker.DeliveryAssignedPayload{
		OrderID:   "ord-1",
		CourierID: "courier-99",
	}

	bytes, err := json.Marshal(payload)
	assert.NoError(t, err)

	var unmarshaled broker.DeliveryAssignedPayload
	err = json.Unmarshal(bytes, &unmarshaled)
	assert.NoError(t, err)
	assert.Equal(t, "ord-1", unmarshaled.OrderID)
	assert.Equal(t, "courier-99", unmarshaled.CourierID)
}

func TestOrderDispatchFailedPayload_JSONMarshalling(t *testing.T) {
	payload := broker.OrderDispatchFailedPayload{
		OrderID: "ord-1",
		Reason:  "NO_COURIERS_AVAILABLE",
	}

	bytes, err := json.Marshal(payload)
	assert.NoError(t, err)

	var unmarshaled broker.OrderDispatchFailedPayload
	err = json.Unmarshal(bytes, &unmarshaled)
	assert.NoError(t, err)
	assert.Equal(t, "ord-1", unmarshaled.OrderID)
	assert.Equal(t, "NO_COURIERS_AVAILABLE", unmarshaled.Reason)
}
