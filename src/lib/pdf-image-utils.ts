/**
 * PDF Image Utilities for Next.js and react-pdf
 * Handles image resolution and conversion for PDF generation
 */

export interface ImageOptions {
  width?: number
  height?: number
  format?: 'png' | 'jpg' | 'jpeg' | 'svg'
  quality?: number
}

export class PDFImageUtils {
  /**
   * Convert image to base64 for PDF compatibility (Node.js compatible)
   */
  static async imageToBase64(imageUrl: string, options: ImageOptions = {}): Promise<string> {
    try {
      // If it's already a data URL, return as-is
      if (imageUrl.startsWith('data:')) {
        return imageUrl
      }

      // Handle external URLs
      let fullUrl = imageUrl
      
      // If it's a relative path, convert to full URL
      if (imageUrl.startsWith('/')) {
        fullUrl = `http://localhost:3000${imageUrl}`
      } else if (!imageUrl.startsWith('http')) {
        fullUrl = `http://localhost:3000/${imageUrl}`
      }

      // Fetch the image
      const response = await fetch(fullUrl)
      
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`)
      }

      // Get image as array buffer
      const arrayBuffer = await response.arrayBuffer()
      
      // Convert to base64 using Node.js Buffer
      const buffer = Buffer.from(arrayBuffer)
      const base64 = buffer.toString('base64')
      
      // Determine MIME type
      const contentType = response.headers.get('content-type') || 'image/png'
      
      // Return data URL
      return `data:${contentType};base64,${base64}`
    } catch (error) {
      console.error('Error converting image to base64:', error)
      throw error
    }
  }

  /**
   * Get optimized image URL for PDF generation
   */
  static async getOptimizedImageUrl(imageUrl: string, options: ImageOptions = {}): Promise<string> {
    try {
      // For SVG files, we can try to use them directly first
      if (imageUrl.toLowerCase().endsWith('.svg')) {
        try {
          // Test if SVG works directly
          await this.testImageDirect(imageUrl)
          return imageUrl
        } catch {
          // If SVG fails, convert to PNG
          console.log('SVG direct loading failed, converting to base64')
          return await this.imageToBase64(imageUrl, options)
        }
      }

      // For PNG/JPG, try direct first, then fallback to base64
      try {
        await this.testImageDirect(imageUrl)
        return imageUrl
      } catch {
        console.log('Direct image loading failed, converting to base64')
        return await this.imageToBase64(imageUrl, options)
      }
    } catch (error) {
      console.error('Error getting optimized image URL:', error)
      // Return fallback image
      return await this.getFallbackImage()
    }
  }

  /**
   * Test if image can be loaded directly (Node.js compatible)
   */
  private static async testImageDirect(imageUrl: string): Promise<void> {
    try {
      let fullUrl = imageUrl
      
      // Handle different URL formats
      if (imageUrl.startsWith('/')) {
        fullUrl = `http://localhost:3000${imageUrl}`
      } else if (imageUrl.startsWith('http')) {
        fullUrl = imageUrl
      } else {
        fullUrl = `http://localhost:3000/${imageUrl}`
      }

      const response = await fetch(fullUrl)
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.status}`)
      }
      
      // If we get here, the image is accessible
      return
    } catch (error) {
      throw new Error(`Failed to load image directly: ${error}`)
    }
  }

  /**
   * Get fallback image (simple colored rectangle)
   */
  static async getFallbackImage(): Promise<string> {
    // Create a simple SVG fallback
    const svg = `
      <svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
        <rect width="100" height="100" fill="#3B82F6" rx="8"/>
        <text x="50" y="50" text-anchor="middle" dy="0.3em" fill="white" font-family="Arial" font-size="12">Logo</text>
      </svg>
    `
    
    const base64 = btoa(svg)
    return `data:image/svg+xml;base64,${base64}`
  }

  /**
   * Get company logo with fallback handling
   */
  static async getCompanyLogo(): Promise<string> {
    try {
      // Try different logo paths in order of preference
      const logoPaths = [
        '/assets/company-logo.png',
        '/logo.svg',
        'http://localhost:3000/assets/company-logo.png',
        'http://localhost:3000/logo.svg'
      ]

      for (const path of logoPaths) {
        try {
          const optimizedUrl = await this.getOptimizedImageUrl(path, {
            width: 120,
            height: 120,
            format: 'png'
          })
          console.log(`Successfully loaded logo from: ${path}`)
          return optimizedUrl
        } catch (error) {
          console.log(`Failed to load logo from ${path}:`, error.message)
          continue
        }
      }

      // If all paths fail, use fallback
      console.log('All logo paths failed, using fallback')
      return await this.getFallbackImage()
    } catch (error) {
      console.error('Error getting company logo:', error)
      return await this.getFallbackImage()
    }
  }

  /**
   * Preload and cache images for better performance
   */
  static async preloadImages(urls: string[]): Promise<Map<string, string>> {
    const cache = new Map<string, string>()
    
    const promises = urls.map(async (url) => {
      try {
        const optimizedUrl = await this.getOptimizedImageUrl(url)
        cache.set(url, optimizedUrl)
      } catch (error) {
        console.error(`Failed to preload image ${url}:`, error)
        const fallback = await this.getFallbackImage()
        cache.set(url, fallback)
      }
    })

    await Promise.all(promises)
    return cache
  }
}