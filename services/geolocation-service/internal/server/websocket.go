package server

import (
	"context"
	"encoding/json"
	"net/http"
	"strings"
	"time"

	"dashroute-lat/services/geolocation-service/internal/auth"
	"dashroute-lat/services/geolocation-service/internal/redis"

	"github.com/gorilla/websocket"
	"go.uber.org/zap"
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,

	CheckOrigin: func(r *http.Request) bool { return true },
}

type PingPayload struct {
	Longitude float64 `json:"longitude"`
	Latitude  float64 `json:"latitude"`
	Status    string  `json:"status"` // e.g., "ONLINE", "BUSY"
}

type Server struct {
	redisClient *redis.Client
	jwtAuth     *auth.Validator
	logger      *zap.Logger
	metrics     *Metrics
}

func NewServer(redisClient *redis.Client, jwtAuth *auth.Validator, metrics *Metrics, logger *zap.Logger) *Server {
	return &Server{
		redisClient: redisClient,
		jwtAuth:     jwtAuth,
		logger:      logger,
		metrics:     metrics,
	}
}

func (s *Server) HandleWebSocket(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	var token string
	authHeader := r.Header.Get("Authorization")
	if after, ok := strings.CutPrefix(authHeader, "Bearer "); ok {
		token = after
	}

	if token == "" {
		s.logger.Warn("Missing token in WebSocket connection request")
		s.metrics.AuthFailures.Add(ctx, 1)
		http.Error(w, "Unauthorized: missing token", http.StatusUnauthorized)
		return
	}

	courierID, err := s.jwtAuth.ValidateCourierToken(token)
	if err != nil {
		s.logger.Warn("Invalid token", zap.Error(err))
		s.metrics.AuthFailures.Add(ctx, 1)
		http.Error(w, "Unauthorized: invalid token", http.StatusUnauthorized)
		return
	}

	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		s.logger.Error("Failed to upgrade connection", zap.Error(err))
		return
	}
	defer conn.Close()

	s.logger.Info("Courier connected", zap.String("courier_id", courierID))
	s.metrics.ActiveConnections.Add(ctx, 1)

	defer func() {
		s.metrics.ActiveConnections.Add(ctx, -1)

		if err := s.redisClient.UpdateStatus(ctx, courierID, "OFFLINE"); err != nil {
			s.logger.Error("Failed to mark courier OFFLINE on disconnect", zap.Error(err))
		}
	}()

	_ = s.redisClient.Heartbeat(ctx, courierID)

	for {
		_, message, err := conn.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				s.logger.Error("Unexpected WebSocket close", zap.Error(err))
			}
			break
		}

		var payload PingPayload
		if err := json.Unmarshal(message, &payload); err != nil {
			s.logger.Error("Invalid payload format", zap.Error(err))
			continue
		}

		s.processPing(ctx, courierID, payload)
	}

	s.logger.Info("Courier disconnected", zap.String("courier_id", courierID))
}

func (s *Server) processPing(ctx context.Context, courierID string, payload PingPayload) {
	start := time.Now()

	if err := s.redisClient.Heartbeat(ctx, courierID); err != nil {
		s.logger.Error("Failed to update heartbeat", zap.Error(err))
	}
	if payload.Longitude != 0 || payload.Latitude != 0 {
		if err := s.redisClient.UpdateLocation(ctx, courierID, payload.Longitude, payload.Latitude); err != nil {
			s.logger.Error("Failed to update location", zap.Error(err))
		}
	}

	if payload.Status != "" {
		if err := s.redisClient.UpdateStatus(ctx, courierID, payload.Status); err != nil {
			s.logger.Error("Failed to update status", zap.Error(err))
		}
	}

	s.metrics.PingsReceived.Add(ctx, 1)
	s.metrics.PingDuration.Record(ctx, time.Since(start).Seconds())
}
