export default function CSSTestPage() {
  return (
    <div className="min-h-screen bg-background text-foreground p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-4xl font-bold text-primary">CSS Test Page</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 bg-card border border-border rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Card Test</h2>
            <p className="text-muted-foreground">This should have proper styling with Tailwind CSS classes.</p>
            <button className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90">
              Test Button
            </button>
          </div>
          
          <div className="p-6 bg-destructive/10 border border-destructive rounded-lg">
            <h2 className="text-xl font-semibold text-destructive mb-4">Destructive Variant</h2>
            <p className="text-destructive-foreground">This should show destructive styling.</p>
          </div>
        </div>
        
        <div className="p-6 bg-muted border border-border rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Support Contract Status Test</h2>
          <div className="flex gap-4">
            <span className="px-3 py-1 border border-green-500 text-green-700 bg-green-50 rounded-full text-sm">
              Active Support
            </span>
            <span className="px-3 py-1 border border-red-500 text-red-700 bg-red-50 rounded-full text-sm">
              Inactive Support
            </span>
          </div>
        </div>
        
        <div className="p-6 bg-accent border border-border rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Drag and Drop Test</h2>
          <div className="draggable p-4 bg-primary/10 border border-primary rounded-lg cursor-grab">
            <p>Draggable Item - Try to drag me!</p>
          </div>
          <div className="drop-target mt-4 p-4 bg-secondary/20 border-2 border-dashed border-secondary rounded-lg min-h-[60px]">
            <p className="text-center text-muted-foreground">Drop Zone</p>
          </div>
        </div>
      </div>
    </div>
  )
}