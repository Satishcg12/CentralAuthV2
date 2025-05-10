package utils

import (
	"net/http"
	"time"

	"github.com/labstack/echo/v4"
)

// Cookie utility functions

func SetCookie(c echo.Context, name, value string, maxAge int) error {
	cookie := &http.Cookie{
		Name:     name,
		Value:    value,
		MaxAge:   maxAge,
		HttpOnly: true,
		Secure:   true,
		SameSite: http.SameSiteStrictMode,
	}
	http.SetCookie(c.Response().Writer, cookie)
	return nil
}

func GetCookie(c echo.Context, name string) (string, error) {
	cookie, err := c.Cookie(name)
	if err != nil {
		if err == http.ErrNoCookie {
			return "", nil
		}
		return "", err
	}
	return cookie.Value, nil
}

func DeleteCookie(c echo.Context, name string) error {
	cookie := &http.Cookie{
		Name:   name,
		MaxAge: -1,
	}
	http.SetCookie(c.Response().Writer, cookie)
	return nil
}

// SetAccessTokenCookie sets only the access token cookie
func SetAccessTokenCookie(c echo.Context, accessToken string) error {
	return SetCookie(c, "access_token", accessToken, int(15*time.Minute.Seconds())) // 15 minutes
}

func SetTokensCookies(c echo.Context, accessToken, refreshToken string) error {
	if err := SetCookie(c, "access_token", accessToken, int(15*time.Minute.Seconds())); err != nil { // 15 minutes
		return err
	}
	return SetCookie(c, "refresh_token", refreshToken, int(30*24*time.Hour.Seconds())) // 30 days
}

func DeleteTokensCookies(c echo.Context) error {
	if err := DeleteCookie(c, "access_token"); err != nil {
		return err
	}
	return DeleteCookie(c, "refresh_token")
}
