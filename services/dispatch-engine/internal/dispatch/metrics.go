package dispatch

import (
	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/metric"
)

type dispatchMetrics struct {
	ordersProcessed metric.Int64Counter

	assignmentDuration metric.Float64Histogram
}

func newDispatchMetrics() (*dispatchMetrics, error) {
	meter := otel.GetMeterProvider().Meter("dispatch-engine")

	ordersProcessed, err := meter.Int64Counter(
		"dispatch.orders.processed",
		metric.WithDescription("Total orders processed by the dispatch engine"),
		metric.WithUnit("{order}"),
	)
	if err != nil {
		return nil, err
	}

	assignmentDuration, err := meter.Float64Histogram(
		"dispatch.courier_assignment.duration",
		metric.WithDescription("Duration of the full courier assignment cycle in seconds"),
		metric.WithUnit("s"),
		metric.WithExplicitBucketBoundaries(0.01, 0.05, 0.1, 0.25, 0.5, 1.0, 2.5),
	)

	if err != nil {
		return nil, err
	}

	return &dispatchMetrics{
		ordersProcessed:    ordersProcessed,
		assignmentDuration: assignmentDuration,
	}, nil
}
