package broker

import (
	"context"
	"encoding/json"
	"time"

	amqp "github.com/rabbitmq/amqp091-go"
	"go.opentelemetry.io/otel"
	"go.uber.org/zap"
)

type EventEnvelope struct {
	EventID    string      `json:"event_id"`
	EventType  string      `json:"event_type"`
	OccurredAt string      `json:"occurred_at"`
	Version    string      `json:"version"`
	Producer   string      `json:"producer"`
	Payload    interface{} `json:"payload"`
}

type OrderCreatedPayload struct {
	OrderID     string  `json:"orderId"`
	CustomerID  string  `json:"customerId"`
	PickupLon   float64 `json:"pickupLon"`
	PickupLat   float64 `json:"pickupLat"`
	DeliveryLon float64 `json:"deliveryLon"`
	DeliveryLat float64 `json:"deliveryLat"`
}

type DeliveryAssignedPayload struct {
	OrderID   string `json:"orderId"`
	CourierID string `json:"courierId"`
}

type OrderDispatchFailedPayload struct {
	OrderID string `json:"orderId"`
	Reason  string `json:"reason"`
}

type Broker struct {
	conn    *amqp.Connection
	channel *amqp.Channel
	logger  *zap.Logger
}

func NewBroker(url string, logger *zap.Logger) *Broker {
	conn, err := amqp.Dial(url)
	if err != nil {
		logger.Fatal("Failed to connect to RabbitMQ", zap.Error(err))
	}

	ch, err := conn.Channel()
	if err != nil {
		logger.Fatal("Failed to open a channel", zap.Error(err))
	}

	err = ch.ExchangeDeclare(
		"dashroute.events",
		"topic",
		true,
		false,
		false,
		false,
		nil,
	)
	if err != nil {
		logger.Fatal("Failed to declare an exchange", zap.Error(err))
	}

	logger.Info("Connected to RabbitMQ successfully")
	return &Broker{
		conn:    conn,
		channel: ch,
		logger:  logger,
	}
}

func (b *Broker) Close() {
	b.channel.Close()
	b.conn.Close()
}

type amqpHeadersCarrier amqp.Table

func (c amqpHeadersCarrier) Get(key string) string {
	if val, ok := c[key]; ok {
		if strVal, ok := val.(string); ok {
			return strVal
		}
	}
	return ""
}

func (c amqpHeadersCarrier) Set(key string, value string) {
	c[key] = value
}

func (c amqpHeadersCarrier) Keys() []string {
	keys := make([]string, 0, len(c))
	for k := range c {
		keys = append(keys, k)
	}
	return keys
}

func (b *Broker) PublishEvent(ctx context.Context, routingKey string, envelope EventEnvelope) error {
	body, err := json.Marshal(envelope)
	if err != nil {
		return err
	}

	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	headers := amqp.Table{}
	otel.GetTextMapPropagator().Inject(ctx, amqpHeadersCarrier(headers))

	return b.channel.PublishWithContext(ctx,
		"dashroute.events",
		routingKey,
		false,
		false,
		amqp.Publishing{
			ContentType:  "application/json",
			DeliveryMode: amqp.Persistent,
			Headers:      headers,
			Body:         body,
		})
}

func (b *Broker) ConsumeOrders(handler func(context.Context, amqp.Delivery)) error {
	q, err := b.channel.QueueDeclare(
		"dispatch.orders.q",
		true,
		false,
		false,
		false,
		nil,
	)
	if err != nil {
		return err
	}

	err = b.channel.QueueBind(
		q.Name,
		"order.created",
		"dashroute.events",
		false,
		nil,
	)
	if err != nil {
		return err
	}

	err = b.channel.Qos(10, 0, false)
	if err != nil {
		return err
	}

	msgs, err := b.channel.Consume(
		q.Name,
		"",
		false,
		false,
		false,
		false,
		nil,
	)
	if err != nil {
		return err
	}

	go func() {
		for d := range msgs {
			ctx := otel.GetTextMapPropagator().Extract(context.Background(), amqpHeadersCarrier(d.Headers))
			handler(ctx, d)
		}
	}()

	return nil
}
