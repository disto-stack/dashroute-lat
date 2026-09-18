package server

import (
	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/metric"
)

type Metrics struct {
	ActiveConnections metric.Int64UpDownCounter
	PingsReceived     metric.Int64Counter
	PingDuration      metric.Float64Histogram
	AuthFailures      metric.Int64Counter
}

func NewMetrics() (*Metrics, error) {
	meter := otel.GetMeterProvider().Meter("geolocation-service")

	activeConnections, err := meter.Int64UpDownCounter(
		"geolocation.active_connections",
		metric.WithDescription("Current number of active WebSocket connections"),
		metric.WithUnit("{connection}"),
	)
	if err != nil {
		return nil, err
	}

	pingsReceived, err := meter.Int64Counter(
		"geolocation.pings.received_total",
		metric.WithDescription("Total number of valid GPS pings processed"),
		metric.WithUnit("{ping}"),
	)
	if err != nil {
		return nil, err
	}

	pingDuration, err := meter.Float64Histogram(
		"geolocation.ping.processing_duration",
		metric.WithDescription("Duration of ping processing (parsing and Redis update)"),
		metric.WithUnit("s"),
		metric.WithExplicitBucketBoundaries(0.001, 0.005, 0.01, 0.025, 0.05, 0.1),
	)
	if err != nil {
		return nil, err
	}

	authFailures, err := meter.Int64Counter(
		"geolocation.auth.failures_total",
		metric.WithDescription("Total number of rejected WebSocket connections due to auth failures"),
		metric.WithUnit("{failure}"),
	)
	if err != nil {
		return nil, err
	}

	return &Metrics{
		ActiveConnections: activeConnections,
		PingsReceived:     pingsReceived,
		PingDuration:      pingDuration,
		AuthFailures:      authFailures,
	}, nil
}
