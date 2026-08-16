package contracts

type OrderCreatedPayload struct {
	OrderID    string  `json:"orderId"`
	CustomerID string  `json:"customerId"`
	PickupLat  float64 `json:"pickupLat"`
	PickupLng  float64 `json:"pickupLng"`
}

type OrderAssignedPayload struct {
	OrderID   string `json:"orderId"`
	CourierID string `json:"courierId"`
}
