'use client'

import { PDFDownloadLink } from '@react-pdf/renderer'
import { TestPDFDocument } from '@/components/pdf-test'

export default function PDFTestPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">PDF Generation Test</h1>
          
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-3">Simple PDF Test</h2>
              <p className="text-gray-600 mb-4">
                This page tests the PDF generation functionality with a simplified document.
                The goal is to isolate any issues with PDF generation.
              </p>
              
              <PDFDownloadLink
                document={<TestPDFDocument />}
                fileName="test-pdf-document.pdf"
                className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
              >
                Download Test PDF
              </PDFDownloadLink>
            </div>

            <div className="border-t pt-6">
              <h2 className="text-xl font-semibold mb-3">Test Checklist</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h3 className="font-medium">Basic Functionality</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>✓ PDF generation library loads</li>
                    <li>✓ Document component renders</li>
                    <li>✓ Page component works</li>
                    <li>✓ Basic text rendering</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h3 className="font-medium">Advanced Features</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>✓ Styling and layout</li>
                    <li>✓ Multi-page support</li>
                    <li>✓ Download functionality</li>
                    <li>✓ File naming</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="border-t pt-6">
              <h2 className="text-xl font-semibold mb-3">Expected Results</h2>
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-medium text-blue-900 mb-2">If PDF generation works correctly:</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Clicking "Download Test PDF" should download a PDF file</li>
                  <li>• The PDF should contain the test content as expected</li>
                  <li>• The file should be named "test-pdf-document.pdf"</li>
                  <li>• The PDF should be properly formatted and readable</li>
                </ul>
              </div>
              
              <div className="bg-red-50 p-4 rounded-lg mt-4">
                <h3 className="font-medium text-red-900 mb-2">If there are issues:</h3>
                <ul className="text-sm text-red-800 space-y-1">
                  <li>• The download button doesn't work</li>
                  <li>• The PDF file is corrupted or empty</li>
                  <li>• The content is not formatted correctly</li>
                  <li>• There are JavaScript errors in the console</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}