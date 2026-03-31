import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Clock, Globe, ArrowUp, ArrowDown } from 'lucide-react';
import { useLocalClock } from '@/hooks/useLocalClock';
import { formatDigitalClock } from '@/lib/formatting';
import {
  MARKET_SESSIONS,
  MARKET_REGIONS,
  MarketRegion,
  MarketSession,
  isMarketOpen,
  getTimeUntilChange,
  getOverlappingSessions,
  getTimelinePosition,
  getCurrentTimePosition,
  getUpcomingEvents,
} from '@/lib/marketSessions';

export default function MarketSessionsClock() {
  const now = useLocalClock(1000);
  const [selectedRegions, setSelectedRegions] = useState<MarketRegion[]>([
    'brazil', 'north-america', 'europe', 'asia'
  ]);

  const filteredSessions = MARKET_SESSIONS.filter(
    session => selectedRegions.includes(session.region)
  );

  const currentTimePosition = getCurrentTimePosition(now);
  const overlaps = getOverlappingSessions(now);
  const upcomingEvents = getUpcomingEvents(now, 4, filteredSessions);

  const hours = Array.from({ length: 24 }, (_, i) => i);

  const renderTooltipContent = (session: MarketSession, isOpen: boolean) => {
    const timeInfo = getTimeUntilChange(session, now);
    
    return (
      <div className="space-y-2 p-1">
        <div className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full shrink-0"
            style={{ backgroundColor: session.color }}
          />
          <span className="font-semibold">{session.name}</span>
        </div>
        <div className="text-xs text-muted-foreground">
          Horário: {session.openTime} - {session.closeTime}
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant={isOpen ? 'default' : 'secondary'}
            className={`text-[10px] px-1.5 py-0 h-4 ${
              isOpen ? 'bg-success/20 text-success' : ''
            }`}
          >
            {isOpen ? 'Aberto' : 'Fechado'}
          </Badge>
          <span className="text-xs text-muted-foreground">
            {timeInfo.isUntilOpen ? 'Abre' : 'Fecha'} em {timeInfo.hours}h {timeInfo.minutes}min
          </span>
        </div>
      </div>
    );
  };

  // Get market status insights
  const getMarketInsights = () => {
    const insights: { emoji: string; text: string; color: string }[] = [];
    
    const usaSessions = filteredSessions.filter(s => s.region === 'north-america');
    const europeSessions = filteredSessions.filter(s => s.region === 'europe');
    const asiaSessions = filteredSessions.filter(s => s.region === 'asia');

    const usaOpen = usaSessions.some(s => isMarketOpen(s, now));
    const europeOpen = europeSessions.some(s => isMarketOpen(s, now));
    const asiaOpen = asiaSessions.some(s => isMarketOpen(s, now));

    if (usaOpen) insights.push({ emoji: '🟢', text: 'EUA aberto — alta volatilidade', color: 'text-success' });
    else insights.push({ emoji: '🔴', text: 'EUA fechado', color: 'text-muted-foreground' });

    if (europeOpen) insights.push({ emoji: '🟢', text: 'Europa aberta', color: 'text-success' });
    else insights.push({ emoji: '🔴', text: 'Europa fechada', color: 'text-muted-foreground' });

    if (asiaOpen) insights.push({ emoji: '🟡', text: 'Ásia ativa — liquidez variável', color: 'text-primary' });
    else insights.push({ emoji: '🔴', text: 'Ásia fechada', color: 'text-muted-foreground' });

    return insights;
  };

  const marketInsights = getMarketInsights();

  return (
    <TooltipProvider delayDuration={200}>
      <Card className="w-full card-glow">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Globe className="w-5 h-5 text-primary" />
              Sessões de Mercado
            </CardTitle>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span className="font-mono-trading text-sm tabular-nums">
                {formatDigitalClock(now)}
              </span>
            </div>
          </div>
          {/* Region Filter */}
          <div className="pt-3">
            <ToggleGroup
              type="multiple"
              value={selectedRegions}
              onValueChange={(value) => setSelectedRegions(value as MarketRegion[])}
              className="flex flex-wrap gap-1 justify-start"
            >
              {(Object.entries(MARKET_REGIONS) as [MarketRegion, { label: string; emoji: string }][]).map(
                ([key, { label, emoji }]) => (
                  <ToggleGroupItem
                    key={key}
                    value={key}
                    size="sm"
                    className="text-xs px-2 py-1 h-7 data-[state=on]:bg-primary/20 data-[state=on]:text-primary"
                  >
                    {emoji} {label}
                  </ToggleGroupItem>
                )
              )}
            </ToggleGroup>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Timeline Visual */}
          <div className="relative">
            {/* Hour markers */}
            <div className="relative h-4 text-xs text-muted-foreground mb-2">
              {hours.filter((_, i) => i % 3 === 0).map((hour) => (
                <span 
                  key={hour} 
                  className="absolute transform -translate-x-1/2 font-mono-trading"
                  style={{ left: `${(hour / 24) * 100}%` }}
                >
                  {hour.toString().padStart(2, '0')}
                </span>
              ))}
            </div>

            {/* Timeline container */}
            <div className="relative h-40 bg-muted/20 rounded-lg overflow-hidden border border-border/30">
              {/* Grid lines */}
              <div className="absolute inset-0">
                {hours.filter((_, i) => i % 3 === 0).map((hour) => (
                  <div
                    key={hour}
                    className="absolute border-l border-border/20 h-full"
                    style={{ left: `${(hour / 24) * 100}%` }}
                  />
                ))}
              </div>

              {/* Market session bars */}
              {filteredSessions.map((session, index) => {
                const startPos = getTimelinePosition(session.openTime);
                const endPos = getTimelinePosition(session.closeTime);
                const isOpen = isMarketOpen(session, now);

                if (session.crossesMidnight) {
                  return (
                    <Tooltip key={session.id}>
                      <TooltipTrigger asChild>
                        <div className="cursor-pointer">
                          <div
                            className="absolute h-5 rounded-sm transition-all duration-300"
                            style={{
                              left: `${startPos}%`,
                              width: `${100 - startPos}%`,
                              top: `${index * 24 + 8}px`,
                              backgroundColor: session.color,
                              opacity: isOpen ? 0.9 : 0.25,
                              boxShadow: isOpen ? `0 0 12px ${session.color}40` : 'none',
                            }}
                          />
                          <div
                            className="absolute h-5 rounded-sm transition-all duration-300"
                            style={{
                              left: '0%',
                              width: `${endPos}%`,
                              top: `${index * 24 + 8}px`,
                              backgroundColor: session.color,
                              opacity: isOpen ? 0.9 : 0.25,
                              boxShadow: isOpen ? `0 0 12px ${session.color}40` : 'none',
                            }}
                          />
                          <span
                            className="absolute text-[10px] font-medium text-white drop-shadow-sm pointer-events-none"
                            style={{
                              left: `${startPos + 1}%`,
                              top: `${index * 24 + 11}px`,
                            }}
                          >
                            {session.abbreviation}
                          </span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="z-50 tooltip-glass">
                        {renderTooltipContent(session, isOpen)}
                      </TooltipContent>
                    </Tooltip>
                  );
                }

                return (
                  <Tooltip key={session.id}>
                    <TooltipTrigger asChild>
                      <div
                        className="absolute h-5 rounded-sm transition-all duration-300 flex items-center px-2 cursor-pointer"
                        style={{
                          left: `${startPos}%`,
                          width: `${endPos - startPos}%`,
                          top: `${index * 24 + 8}px`,
                          backgroundColor: session.color,
                          opacity: isOpen ? 0.9 : 0.25,
                          boxShadow: isOpen ? `0 0 12px ${session.color}40` : 'none',
                        }}
                      >
                        <span className="text-[10px] font-medium text-white drop-shadow-sm truncate">
                          {session.abbreviation}
                        </span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="z-50 tooltip-glass">
                      {renderTooltipContent(session, isOpen)}
                    </TooltipContent>
                  </Tooltip>
                );
              })}

              {/* Current time indicator — "Agora" with glow + pulse */}
              <div
                className="absolute top-0 bottom-0 w-0.5 z-10 now-pulse"
                style={{
                  left: `${currentTimePosition}%`,
                  backgroundColor: 'hsl(43 85% 52%)',
                  boxShadow: '0 0 8px hsl(43 85% 52% / 0.4)',
                }}
              >
                <div className="absolute -top-5 left-1/2 -translate-x-1/2 text-[9px] font-semibold text-primary whitespace-nowrap">
                  Agora
                </div>
                <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-primary rounded-full shadow-[0_0_8px_hsl(43_85%_52%/0.5)]" />
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-primary rounded-full shadow-[0_0_8px_hsl(43_85%_52%/0.5)]" />
              </div>
            </div>
          </div>

          {/* Market Insights */}
          <div className="flex flex-wrap gap-3">
            {marketInsights.map((insight, i) => (
              <div key={i} className={`flex items-center gap-1.5 text-xs ${insight.color}`}>
                <span>{insight.emoji}</span>
                <span className="font-medium">{insight.text}</span>
              </div>
            ))}
          </div>

          {/* Legend and Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Market Status List */}
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-muted-foreground mb-3">Status dos Mercados</h4>
              <div className="grid grid-cols-2 gap-2">
                {filteredSessions.map((session) => {
                  const isOpen = isMarketOpen(session, now);
                  const timeInfo = getTimeUntilChange(session, now);

                  return (
                    <div
                      key={session.id}
                      className="flex items-center gap-2 p-2.5 rounded-lg bg-muted/20 border border-border/30"
                    >
                      <div
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{
                          backgroundColor: session.color,
                          boxShadow: isOpen ? `0 0 8px ${session.color}60` : 'none',
                        }}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-medium truncate">{session.name}</span>
                          <Badge
                            variant={isOpen ? 'default' : 'secondary'}
                            className={`text-[10px] px-1.5 py-0 h-4 ${
                              isOpen ? 'bg-success/20 text-success hover:bg-success/30' : ''
                            }`}
                          >
                            {isOpen ? 'Aberto' : 'Fechado'}
                          </Badge>
                        </div>
                        <span className="text-[10px] text-muted-foreground font-mono-trading">
                          {timeInfo.isUntilOpen ? 'Abre' : 'Fecha'} em {timeInfo.hours}h {timeInfo.minutes}min
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Overlaps and Schedule */}
            <div className="space-y-4">
              {/* Upcoming Events */}
              <div>
                <h4 className="text-sm font-semibold text-muted-foreground mb-2 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  Próximos Eventos
                </h4>
                <div className="space-y-1.5">
                  {upcomingEvents.map((event, index) => (
                    <div
                      key={`${event.marketId}-${event.eventType}`}
                      className={`flex items-center justify-between p-2.5 rounded-lg text-xs ${
                        index === 0 ? 'bg-primary/10 ring-1 ring-primary/20' : 'bg-muted/20 border border-border/30'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: event.marketColor }}
                        />
                        <span className="font-medium">{event.marketAbbreviation}</span>
                          <Badge
                          variant="secondary"
                          className={`text-[10px] px-1.5 py-0 h-4 gap-0.5 ${
                            event.eventType === 'open'
                              ? 'bg-success/20 text-success'
                              : 'bg-destructive/20 text-destructive'
                          }`}
                        >
                          {event.eventType === 'open' ? (
                            <ArrowUp className="w-2.5 h-2.5" />
                          ) : (
                            <ArrowDown className="w-2.5 h-2.5" />
                          )}
                          {event.eventType === 'open' ? 'Abre' : 'Fecha'}
                        </Badge>
                      </div>
                      <div className="text-right">
                        <span className="text-muted-foreground font-mono-trading">
                          {Math.floor(event.minutesUntil / 60)}h {event.minutesUntil % 60}min
                        </span>
                        <span className="text-muted-foreground/60 ml-1.5">
                          ({event.eventTime})
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Brazilian Markets Highlight */}
              <div>
                <h4 className="text-sm font-semibold text-muted-foreground mb-2">Mercados Brasileiros</h4>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between items-center p-2.5 rounded-lg bg-success/10 border border-success/20">
                    <span className="font-medium">B3 Futuro</span>
                    <span className="text-muted-foreground font-mono-trading">09:00 - 18:30</span>
                  </div>
                  <div className="flex justify-between items-center p-2.5 rounded-lg bg-success/10 border border-success/20">
                    <span className="font-medium">B3 À Vista</span>
                    <span className="text-muted-foreground font-mono-trading">10:00 - 17:55</span>
                  </div>
                </div>
              </div>

              {/* Overlapping Sessions */}
              {overlaps.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-muted-foreground mb-2">Sobreposições Ativas</h4>
                  <div className="space-y-1">
                    {overlaps.map((overlap, i) => (
                      <div
                        key={i}
                        className="text-xs p-2.5 rounded-lg bg-primary/10 text-primary border border-primary/20"
                      >
                        {overlap}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}
