import React, { useState } from 'react';
import { MapPin, Navigation, Train, Bus, Map, AlertTriangle, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import heroBackground from '@/assets/hero-bg.jpg';

interface RouteResult {
  steps: Array<{
    mode: 'metro' | 'bus' | 'train';
    description: string;
    duration: string;
  }>;
  totalTime: string;
  cost: string;
  googleMapsLink?: string;
}

export default function CirkleInterface() {
  const [city, setCity] = useState('');
  const [fromLocation, setFromLocation] = useState('');
  const [toLocation, setToLocation] = useState('');
  const [modePreference, setModePreference] = useState('');
  const [results, setResults] = useState<RouteResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showError, setShowError] = useState(false);

  const cities = [
    { value: 'mumbai', label: 'Mumbai' },
    { value: 'delhi', label: 'Delhi' },
    { value: 'bangalore', label: 'Bangalore' },
    { value: 'hyderabad', label: 'Hyderabad' }
  ];

  const modes = [
    { value: 'any', label: 'Any' },
    { value: 'metro', label: 'Metro' },
    { value: 'train', label: 'Train' },
    { value: 'bus', label: 'Bus' }
  ];

  const query = async (data: any) => {
    const response = await fetch(
      "https://api.stack-ai.com/inference/v0/run/fe4d5f64-3d15-4c68-bd50-a93c180d5728/68c3b10e6c7b18f16fc74272",
      {
        headers: {
          'Authorization': 'Bearer 4235bd26-70f9-4399-92f3-f5d481b9fd2a',
          'Content-Type': 'application/json'
        },
        method: "POST",
        body: JSON.stringify(data),
      }
    );
    const result = await response.json();
    return result;
  };

  const handleFindRoute = async () => {
    if (!city || !fromLocation || !toLocation) {
      setShowError(true);
      setTimeout(() => setShowError(false), 3000);
      return;
    }

    setIsLoading(true);
    setShowError(false);
    setResults(null);
    
    try {
      const inputData = {
        "user_id": "cirkle_user_" + Date.now(),
        "in-0": `Find route from ${fromLocation} to ${toLocation} in ${city}. Transport preference: ${modePreference || 'any'}.`
      };

      const result = await query(inputData);
      
      if (result && result.outputs && result.outputs['out-0']) {
        const routeText = result.outputs['out-0'];
        
        // Extract Google Maps link
        const googleMapsMatch = routeText.match(/\(https:\/\/www\.google\.com\/maps\/[^)]+\)/);
        const googleMapsLink = googleMapsMatch ? googleMapsMatch[0].slice(1, -1) : null;
        
        // Extract numbered steps (1. **Step**: Description)
        const steps = [];
        const numberedSteps = routeText.match(/\d+\.\s\*\*[^*]+\*\*:[^]*?(?=\d+\.\s\*\*|\*\*Estimated|Open in Google Maps|$)/g);
        
        if (numberedSteps) {
          numberedSteps.forEach((stepText) => {
            const cleanStep = stepText.replace(/\*\*/g, '').trim();
            const mode: 'metro' | 'bus' | 'train' = cleanStep.toLowerCase().includes('metro') ? 'metro' : 
                      cleanStep.toLowerCase().includes('bus') ? 'bus' : 'train';
            
            steps.push({
              mode,
              description: cleanStep,
              duration: ''
            });
          });
        }
        
        // Extract estimated total travel time
        const timeMatch = routeText.match(/\*\*Estimated Total Travel Time\*\*:\s*([^.\n]+)/);
        const totalTime = timeMatch ? timeMatch[1].trim() : 'Not specified';
        
        setResults({
          steps,
          totalTime,
          cost: 'Varies by transport mode',
          googleMapsLink
        });
      } else {
        setShowError(true);
        setTimeout(() => setShowError(false), 5000);
      }
    } catch (error) {
      console.error('Stack AI API Error:', error);
      setShowError(true);
      setTimeout(() => setShowError(false), 5000);
    } finally {
      setIsLoading(false);
    }
  };

  const getModeIcon = (mode: 'metro' | 'bus' | 'train') => {
    switch (mode) {
      case 'metro': return <Train className="w-5 h-5 text-accent" />;
      case 'bus': return <Bus className="w-5 h-5 text-accent" />;
      case 'train': return <Train className="w-5 h-5 text-accent" />;
    }
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Hero Background */}
      <div 
        className="absolute inset-0 opacity-20 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroBackground})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-background/95 via-background/90 to-background/95" />
      
      {/* Main Content */}
      <div className="relative z-10 p-4 lg:p-8">
        <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <header className="text-center space-y-4 animate-fade-in-up">
          <div className="flex items-center justify-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center glow-primary animate-float">
              <Zap className="w-6 h-6 text-background" />
            </div>
            <h1 className="text-5xl font-bold text-glow">Cirkle</h1>
          </div>
          <p className="text-xl text-foreground/80 font-light">Smart Routes, Smarter Travel.</p>
        </header>

        {/* Input Section */}
        <Card className="glass p-8 rounded-2xl border-glass-border shadow-elevated animate-fade-in-up">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* City Selection */}
            <div className="space-y-2">
              <Label className="text-foreground/90 font-medium">City</Label>
              <Select value={city} onValueChange={setCity}>
                <SelectTrigger className="glass-hover border-glass-border bg-glass/40 text-foreground">
                  <SelectValue placeholder="Select your city" />
                </SelectTrigger>
                <SelectContent className="glass border-glass-border">
                  {cities.map((cityOption) => (
                    <SelectItem key={cityOption.value} value={cityOption.value}>
                      {cityOption.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Mode Preference */}
            <div className="space-y-2">
              <Label className="text-foreground/90 font-medium">Mode Preference</Label>
              <Select value={modePreference} onValueChange={setModePreference}>
                <SelectTrigger className="glass-hover border-glass-border bg-glass/40 text-foreground">
                  <SelectValue placeholder="Select transport mode" />
                </SelectTrigger>
                <SelectContent className="glass border-glass-border">
                  {modes.map((mode) => (
                    <SelectItem key={mode.value} value={mode.value}>
                      {mode.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* From Location */}
            <div className="space-y-2">
              <Label className="text-foreground/90 font-medium">From</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-primary" />
                <Input
                  value={fromLocation}
                  onChange={(e) => setFromLocation(e.target.value)}
                  placeholder="Enter starting location"
                  className="glass-hover border-glass-border bg-glass/40 pl-11 text-foreground placeholder:text-foreground/50"
                />
              </div>
            </div>

            {/* To Location */}
            <div className="space-y-2">
              <Label className="text-foreground/90 font-medium">To</Label>
              <div className="relative">
                <Navigation className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-accent" />
                <Input
                  value={toLocation}
                  onChange={(e) => setToLocation(e.target.value)}
                  placeholder="Enter destination"
                  className="glass-hover border-glass-border bg-glass/40 pl-11 text-foreground placeholder:text-foreground/50"
                />
              </div>
            </div>
          </div>

          {/* Find Route Button */}
          <div className="mt-8 flex justify-center">
            <Button 
              onClick={handleFindRoute}
              disabled={isLoading}
              className="gradient-primary hover:scale-105 transition-all duration-300 text-lg px-12 py-6 rounded-2xl font-semibold glow-primary animate-glow shadow-lg"
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-5 h-5 border-2 border-background/30 border-t-background rounded-full animate-spin" />
                  <span>Finding Route...</span>
                </div>
              ) : (
                'Find Route'
              )}
            </Button>
          </div>
        </Card>

        {/* Error Notification */}
        {showError && (
          <Card className="bg-destructive/10 border-destructive/20 p-4 rounded-2xl animate-fade-in-up">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              <span className="text-destructive font-medium">
                ⚠️ Unable to fetch results. Please try again.
              </span>
            </div>
          </Card>
        )}

        {/* Results Section */}
        {results && (
          <Card className="glass p-8 rounded-2xl border-glass-border shadow-elevated animate-fade-in-up">
            <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center space-x-2">
              <Zap className="w-6 h-6 text-primary" />
              <span>Suggested Route</span>
            </h2>
            
            <div className="space-y-6">
              {/* Route Steps */}
              <div className="space-y-4">
                {results.steps.map((step, index) => (
                  <div key={index} className="flex items-start space-x-4 p-4 glass rounded-xl">
                    {getModeIcon(step.mode)}
                    <div className="flex-1">
                      <div className="font-medium text-foreground leading-relaxed">{step.description}</div>
                      {step.duration && <p className="text-sm text-foreground/60 mt-1">{step.duration}</p>}
                    </div>
                  </div>
                ))}
              </div>

              {/* Summary */}
              <div className="flex flex-wrap gap-6 pt-4 border-t border-glass-border">
                {results.totalTime && (
                  <div className="flex items-center space-x-2 text-primary">
                    <span className="font-semibold">Total Time:</span>
                    <span className="text-foreground">{results.totalTime}</span>
                  </div>
                )}
                {results.cost && (
                  <div className="flex items-center space-x-2 text-accent">
                    <span className="font-semibold">Cost:</span>
                    <span className="text-foreground">{results.cost}</span>
                  </div>
                )}
              </div>

              {/* Google Maps Button */}
              {results.googleMapsLink && (
                <div className="flex justify-center pt-4">
                  <Button 
                    variant="outline" 
                    className="border-accent/30 text-accent hover:bg-accent/10 hover:border-accent/50 rounded-xl px-8 py-3 transition-all duration-300"
                    onClick={() => window.open(results.googleMapsLink, '_blank')}
                  >
                    <Map className="w-5 h-5 mr-2" />
                    Open in Google Maps
                  </Button>
                </div>
              )}
            </div>
          </Card>
        )}
      </div>
    </div>
    </div>
  );
}