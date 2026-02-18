import { Card } from "@/components/ui/card";

export default function Cars() {
  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-foreground mb-8">Cars</h1>
        <Card className="p-6 bg-card text-card-foreground rounded-xl shadow-md p-4">
          <p className="text-muted-foreground">Cars page coming soon</p>
        </Card>
      </div>
    </div>
  );
}
