package dispatch

import (
	"context"
	"encoding/json"
	"time"

	"github.com/google/uuid"
	amqp "github.com/rabbitmq/amqp091-go"
	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/attribute"
	"go.opentelemetry.io/otel/trace"
	"go.uber.org/zap"

	"github.com/dashroute/dispatch-engine/internal/broker"
	"github.com/dashroute/dispatch-engine/internal/redis"
)

type Processor struct {
	brokerClient *broker.Broker
	redisClient  *redis.Client
	logger       *zap.Logger
	tracer       trace.Tracer
}

func NewProcessor(b *broker.Broker, r *redis.Client, logger *zap.Logger) *Processor {
	return &Processor{
		brokerClient: b,
		redisClient:  r,
		logger:       logger,
		tracer:       otel.Tracer("dispatch-engine/processor"),
	}
}

func (p *Processor) Start() error {
	p.logger.Info("Starting dispatch processor...")
	return p.brokerClient.ConsumeOrders(p.handleOrderCreated)
}

func (p *Processor) handleOrderCreated(ctx context.Context, d amqp.Delivery) {
	ctx, span := p.tracer.Start(ctx, "ConsumeOrderCreated")
	defer span.End()

	var envelope broker.EventEnvelope
	if err := json.Unmarshal(d.Body, &envelope); err != nil {
		p.logger.Error("Failed to unmarshal event envelope", zap.Error(err))
		span.RecordError(err)
		d.Nack(false, false)
		return
	}

	payloadBytes, _ := json.Marshal(envelope.Payload)
	var orderPayload broker.OrderCreatedPayload
	if err := json.Unmarshal(payloadBytes, &orderPayload); err != nil {
		p.logger.Error("Failed to unmarshal order payload", zap.Error(err))
		span.RecordError(err)
		d.Nack(false, false)
		return
	}

	span.SetAttributes(attribute.String("order.id", orderPayload.OrderID))

	p.logger.Info("Processing order",
		zap.String("orderId", orderPayload.OrderID),
		zap.String("customerId", orderPayload.CustomerID),
		zap.Float64("lon", orderPayload.PickupLon),
		zap.Float64("lat", orderPayload.PickupLat),
	)

	couriers, err := p.redisClient.SearchNearbyCouriers(ctx, orderPayload.PickupLon, orderPayload.PickupLat, 3.0, 5)
	if err != nil {
		p.logger.Error("Error searching for couriers", zap.Error(err))
		span.RecordError(err)
		d.Nack(false, true)
		return
	}
	span.SetAttributes(attribute.Int("couriers.found", len(couriers)))

	for _, courierID := range couriers {
		status, err := p.redisClient.GetCourierStatus(ctx, courierID)
		if err != nil {
			p.logger.Warn("Error getting status for courier", zap.String("courierId", courierID), zap.Error(err))
			continue
		}

		if status != "IDLE" {
			continue
		}

		locked, err := p.redisClient.AcquireLock(ctx, courierID)
		if err != nil {
			p.logger.Warn("Error acquiring lock for courier", zap.String("courierId", courierID), zap.Error(err))
			continue
		}

		if locked {
			span.SetAttributes(attribute.String("courier.assigned", courierID))
			p.logger.Info("Successfully locked courier", zap.String("courierId", courierID), zap.String("orderId", orderPayload.OrderID))
			p.publishSuccess(ctx, orderPayload.OrderID, courierID)
			d.Ack(false)
			return
		}
	}

	p.logger.Info("No available couriers found. Emitting dispatch_failed", zap.String("orderId", orderPayload.OrderID))
	p.publishFailFast(ctx, orderPayload.OrderID, "NO_COURIERS_AVAILABLE")
	d.Ack(false)
}

func (p *Processor) publishSuccess(ctx context.Context, orderID, courierID string) {
	ctx, span := p.tracer.Start(ctx, "PublishDeliveryAssigned")
	defer span.End()

	envelope := broker.EventEnvelope{
		EventID:    uuid.NewString(),
		EventType:  "delivery.assigned",
		OccurredAt: time.Now().UTC().Format(time.RFC3339),
		Version:    "1.0",
		Producer:   "dispatch-engine",
		Payload: broker.DeliveryAssignedPayload{
			OrderID:   orderID,
			CourierID: courierID,
		},
	}
	err := p.brokerClient.PublishEvent(ctx, "delivery.assigned", envelope)
	if err != nil {
		p.logger.Error("Failed to publish delivery.assigned", zap.String("orderId", orderID), zap.Error(err))
		span.RecordError(err)
	}
}

func (p *Processor) publishFailFast(ctx context.Context, orderID, reason string) {
	ctx, span := p.tracer.Start(ctx, "PublishOrderDispatchFailed")
	defer span.End()

	envelope := broker.EventEnvelope{
		EventID:    uuid.NewString(),
		EventType:  "order.dispatch_failed",
		OccurredAt: time.Now().UTC().Format(time.RFC3339),
		Version:    "1.0",
		Producer:   "dispatch-engine",
		Payload: broker.OrderDispatchFailedPayload{
			OrderID: orderID,
			Reason:  reason,
		},
	}
	err := p.brokerClient.PublishEvent(ctx, "order.dispatch_failed", envelope)
	if err != nil {
		p.logger.Error("Failed to publish order.dispatch_failed", zap.String("orderId", orderID), zap.Error(err))
		span.RecordError(err)
	}
}
