package auth_test

import (
	"testing"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/stretchr/testify/assert"

	"dashroute-lat/services/geolocation-service/internal/auth"
)

func createToken(secret, role, sub, courierId string, exp time.Duration) string {
	claims := auth.Claims{
		Sub:       sub,
		Role:      role,
		CourierId: courierId,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(exp)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, _ := token.SignedString([]byte(secret))
	return tokenString
}

func TestValidateCourierToken_Success(t *testing.T) {
	secret := "test-secret"
	validator := auth.NewValidator(secret)

	token := createToken(secret, "COURIER", "usr-123", "courier-123", time.Hour)
	sub, err := validator.ValidateCourierToken(token)

	assert.NoError(t, err)
	assert.Equal(t, "courier-123", sub)
}

func TestValidateCourierToken_InvalidRole(t *testing.T) {
	secret := "test-secret"
	validator := auth.NewValidator(secret)

	token := createToken(secret, "CUSTOMER", "customer-123", "", time.Hour)
	_, err := validator.ValidateCourierToken(token)

	assert.Error(t, err)
	assert.Equal(t, "unauthorized role", err.Error())
}

func TestValidateCourierToken_Expired(t *testing.T) {
	secret := "test-secret"
	validator := auth.NewValidator(secret)

	token := createToken(secret, "COURIER", "user-123", "courier-123", -time.Hour) // expired
	_, err := validator.ValidateCourierToken(token)

	assert.Error(t, err)
	assert.Contains(t, err.Error(), "token is expired")
}

func TestValidateCourierToken_WrongSecret(t *testing.T) {
	validator := auth.NewValidator("right-secret")
	token := createToken("wrong-secret", "COURIER", "user-123", "courier-123", time.Hour)
	_, err := validator.ValidateCourierToken(token)

	assert.Error(t, err)
	assert.Contains(t, err.Error(), "signature is invalid")
}
