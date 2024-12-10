package handlers

import (
	"encoding/json"
	"net/http"
	"time"

	"github.com/kha0sys/melowod/internal/application"
	"github.com/kha0sys/melowod/internal/domain/wod"
)

type WodHandlers struct {
	wodService *application.WodService
}

func NewWodHandlers(wodService *application.WodService) *WodHandlers {
	return &WodHandlers{
		wodService: wodService,
	}
}

func (h *WodHandlers) CreateDailyWod(w http.ResponseWriter, r *http.Request) {
	var wodReq wod.Wod
	if err := json.NewDecoder(r.Body).Decode(&wodReq); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	if err := h.wodService.CreateDailyWod(r.Context(), &wodReq); err != nil {
		if err == application.ErrWodAlreadyExists {
			http.Error(w, err.Error(), http.StatusConflict)
			return
		}
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
}

func (h *WodHandlers) GetWodByDate(w http.ResponseWriter, r *http.Request) {
	dateStr := r.URL.Query().Get("date")
	if dateStr == "" {
		dateStr = time.Now().Format("2006-01-02")
	}

	date, err := time.Parse("2006-01-02", dateStr)
	if err != nil {
		http.Error(w, "invalid date format", http.StatusBadRequest)
		return
	}

	wodData, err := h.wodService.GetWodByDate(r.Context(), date)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	if wodData == nil {
		http.Error(w, "wod not found", http.StatusNotFound)
		return
	}

	json.NewEncoder(w).Encode(wodData)
}

func (h *WodHandlers) SubmitWodResult(w http.ResponseWriter, r *http.Request) {
	var result wod.WodResult
	if err := json.NewDecoder(r.Body).Decode(&result); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	if err := h.wodService.SubmitWodResult(r.Context(), &result); err != nil {
		switch err {
		case application.ErrWodNotFound:
			http.Error(w, err.Error(), http.StatusNotFound)
		case application.ErrUserNotFound:
			http.Error(w, err.Error(), http.StatusNotFound)
		default:
			http.Error(w, err.Error(), http.StatusInternalServerError)
		}
		return
	}

	w.WriteHeader(http.StatusCreated)
}

func (h *WodHandlers) GetLeaderboard(w http.ResponseWriter, r *http.Request) {
	wodID := r.URL.Query().Get("wodId")
	if wodID == "" {
		http.Error(w, "wodId is required", http.StatusBadRequest)
		return
	}

	levelStr := r.URL.Query().Get("level")
	if levelStr == "" {
		levelStr = string(wod.RX)
	}

	results, err := h.wodService.GetLeaderboard(r.Context(), wodID, wod.DifficultyLevel(levelStr), 100)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(results)
}
