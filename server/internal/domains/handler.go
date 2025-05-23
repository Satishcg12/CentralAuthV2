package domains

import (
	"github.com/Satishcg12/CentralAuthV2/server/internal/config"
	"github.com/Satishcg12/CentralAuthV2/server/internal/db"
)

type AppHandlers struct {
	Store *db.Store
	Cfg   *config.Config
}
