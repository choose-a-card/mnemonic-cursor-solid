// Test utilities for unit testing only
// This file contains test-specific implementations and should not be imported in production code
import type { URLParser } from './urlParsers'

// Test URL parser for unit tests
export class TestURLParser implements URLParser {
  private searchParams: URLSearchParams

  constructor(searchString: string = '') {
    this.searchParams = new URLSearchParams(searchString)
  }

  getSearchParams(): URLSearchParams {
    return this.searchParams
  }

  // Method to update search params for testing
  updateSearch(searchString: string): void {
    this.searchParams = new URLSearchParams(searchString)
  }
} 