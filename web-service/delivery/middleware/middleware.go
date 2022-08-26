package middleware

type Middleware struct {
	adminToken string
}

func NewMiddleware(adminToken string) *Middleware {
	return &Middleware{
		adminToken: adminToken,
	}
}
