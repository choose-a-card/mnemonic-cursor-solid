// URL parser interface and implementations

// URL parser interface for dependency injection
export interface URLParser {
  getSearchParams(): URLSearchParams
}

// Default URL parser that uses window.location
export class WindowURLParser implements URLParser {
  getSearchParams(): URLSearchParams {
    return new URLSearchParams(window.location.search)
  }
} 