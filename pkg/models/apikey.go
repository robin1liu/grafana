package models

import (
	"errors"
	"time"
)

var ErrInvalidApiKey = errors.New("Invalid API Key")

type ApiKey struct {
	Id        int64
	AccountId int64
	Name      string
	Key       string
	Role      RoleType
	Created   time.Time
	Updated   time.Time
}

// ---------------------
// COMMANDS
type AddApiKeyCommand struct {
	Name      string   `json:"name" binding:"required"`
	Role      RoleType `json:"role" binding:"required"`
	AccountId int64    `json:"-"`
	Key       string   `json:"-"`

	Result *ApiKey `json:"-"`
}

type UpdateApiKeyCommand struct {
	Id   int64    `json:"id"`
	Name string   `json:"name"`
	Role RoleType `json:"role"`

	AccountId int64 `json:"-"`
}

type DeleteApiKeyCommand struct {
	Id        int64 `json:"id"`
	AccountId int64 `json:"-"`
}

// ----------------------
// QUERIES

type GetApiKeysQuery struct {
	AccountId int64
	Result    []*ApiKey
}

type GetApiKeyByKeyQuery struct {
	Key    string
	Result *ApiKey
}

// ------------------------
// DTO & Projections

type ApiKeyDTO struct {
	Id   int64    `json:"id"`
	Name string   `json:"name"`
	Key  string   `json:"key"`
	Role RoleType `json:"role"`
}
