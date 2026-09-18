package server_test

import (
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"

	"github.com/alicebob/miniredis/v2"
	"github.com/golang-jwt/jwt/v5"
	"github.com/gorilla/websocket"
	goredis "github.com/redis/go-redis/v9"
	"github.com/stretchr/testify/assert"
	"go.opentelemetry.io/otel"
	"go.uber.org/zap"

	"dashroute-lat/services/geolocation-service/internal/auth"
	"dashroute-lat/services/geolocation-service/internal/redis"
	"dashroute-lat/services/geolocation-service/internal/server"
)

const secret = "test-secret"

func createTestToken(role, sub, courierId string) string {
	claims := auth.Claims{
		Sub:       sub,
		Role:      role,
		CourierId: courierId,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(time.Hour)),
		},
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, _ := token.SignedString([]byte(secret))
	return tokenString
}

func setupTestServer(t *testing.T) (*miniredis.Miniredis, *httptest.Server, *server.Server) {
	s := miniredis.RunT(t)
	logger := zap.NewNop()

	db := goredis.NewClient(&goredis.Options{Addr: s.Addr()})
	redisClient := redis.NewClientWithDB(db, logger)

	jwtValidator := auth.NewValidator(secret)

	otel.SetMeterProvider(otel.GetMeterProvider())
	metrics, _ := server.NewMetrics()

	wsServer := server.NewServer(redisClient, jwtValidator, metrics, logger)

	mux := http.NewServeMux()
	mux.HandleFunc("/ws", wsServer.HandleWebSocket)

	httpServer := httptest.NewServer(mux)

	return s, httpServer, wsServer
}

func TestWebSocket_Unauthorized(t *testing.T) {
	_, httpServer, _ := setupTestServer(t)
	defer httpServer.Close()

	wsURL := strings.Replace(httpServer.URL, "http", "ws", 1) + "/ws"

	_, resp, err := websocket.DefaultDialer.Dial(wsURL, nil)
	assert.Error(t, err)
	assert.Equal(t, http.StatusUnauthorized, resp.StatusCode)

	invalidHeaders := http.Header{"Authorization": {"Bearer invalid"}}
	_, resp, err = websocket.DefaultDialer.Dial(wsURL, invalidHeaders)
	assert.Error(t, err)
	assert.Equal(t, http.StatusUnauthorized, resp.StatusCode)

	badToken := createTestToken("CUSTOMER", "c-123", "")
	badHeaders := http.Header{"Authorization": {"Bearer " + badToken}}
	_, resp, err = websocket.DefaultDialer.Dial(wsURL, badHeaders)
	assert.Error(t, err)
	assert.Equal(t, http.StatusUnauthorized, resp.StatusCode)
}

func TestWebSocket_SuccessAndPing(t *testing.T) {
	s, httpServer, _ := setupTestServer(t)
	defer httpServer.Close()
	defer s.Close()

	token := createTestToken("COURIER", "usr-123", "courier-123")
	wsURL := strings.Replace(httpServer.URL, "http", "ws", 1) + "/ws"

	headers := http.Header{"Authorization": {"Bearer " + token}}

	conn, resp, err := websocket.DefaultDialer.Dial(wsURL, headers)
	assert.NoError(t, err)
	assert.Equal(t, http.StatusSwitchingProtocols, resp.StatusCode)
	defer conn.Close()

	time.Sleep(50 * time.Millisecond)

	val, err := s.Get("courier:heartbeat:courier-123")
	assert.NoError(t, err)
	assert.Equal(t, "1", val)

	pingPayload := server.PingPayload{
		Longitude: -74.006,
		Latitude:  40.7128,
		Status:    "ONLINE",
	}
	err = conn.WriteJSON(pingPayload)
	assert.NoError(t, err)

	time.Sleep(50 * time.Millisecond)

	status := s.HGet("courier:status:courier-123", "status")
	assert.Equal(t, "ONLINE", status)

	res, err := s.ZScore("couriers:locations", "courier-123")
	assert.NoError(t, err)
	assert.NotZero(t, res)
}
