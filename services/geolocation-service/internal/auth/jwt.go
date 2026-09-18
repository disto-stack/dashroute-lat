package auth

import (
	"errors"
	"fmt"

	"github.com/golang-jwt/jwt/v5"
)

type Claims struct {
	Sub       string `json:"sub"`
	Role      string `json:"role"`
	CourierId string `json:"courierId"`
	jwt.RegisteredClaims
}

type Validator struct {
	secretKey []byte
}

func NewValidator(secret string) *Validator {
	return &Validator{
		secretKey: []byte(secret),
	}
}

func (v *Validator) ValidateCourierToken(tokenString string) (string, error) {
	token, err := jwt.ParseWithClaims(tokenString, &Claims{}, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return v.secretKey, nil
	})

	if err != nil {
		return "", err
	}

	claims, ok := token.Claims.(*Claims)
	if !ok || !token.Valid {
		return "", errors.New("invalid token claims")
	}

	if claims.Role != "COURIER" {
		return "", errors.New("unauthorized role")
	}

	if claims.CourierId == "" {
		return "", errors.New("missing courierId in token")
	}

	return claims.CourierId, nil
}
