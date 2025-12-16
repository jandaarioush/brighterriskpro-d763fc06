import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Clock, Globe } from 'lucide-react';
import { useLocalClock } from '@/hooks/useLocalClock';
import { formatDigitalClock } from '@/lib/formatting';
import { ArrowUp, ArrowDown } from 'lucide-react';
import {
  MARKET_SESSIONS,
  isMarketOpen,
  getTimeUntilChange,
  getOverlappingSessions,
  getTimelinePosition,
  getCurrentTimePosition,
  getUpcomingEvents,
} from '@/lib/marketSessions';

export default function MarketSessionsClock() {
  const now = useLocalClock(1000);
  const currentTimePosition = getCurrentTimePosition(now);
  const overlaps = getOverlappingSessions(now);
  const upcomingEvents = getUpcomingEvents(now, 4);

  const hours = Array.from({ length: 24 }, (_, i) => i);

  const renderTooltipContent = (session: typeof MARKET_SESSIONS[0], isOpen: boolean) => {
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
              isOpen ? 'bg-green-500/20 text-green-500' : ''
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

  return (
    <TooltipProvider delayDuration={200}>
      <Card className="w-full">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Globe className="w-5 h-5" />
              Sessões de Mercado
            </CardTitle>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span className="font-mono text-sm tabular-nums">
                {formatDigitalClock(now)}
              </span>
            </div>
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
                  className="absolute transform -translate-x-1/2"
                  style={{ left: `${(hour / 24) * 100}%` }}
                >
                  {hour.toString().padStart(2, '0')}
                </span>
              ))}
            </div>

            {/* Timeline container */}
            <div className="relative h-40 bg-muted/30 rounded-lg overflow-hidden">
              {/* Grid lines */}
              <div className="absolute inset-0">
                {hours.filter((_, i) => i % 3 === 0).map((hour) => (
                  <div
                    key={hour}
                    className="absolute border-l border-border/30 h-full"
                    style={{ left: `${(hour / 24) * 100}%` }}
                  />
                ))}
              </div>

              {/* Market session bars */}
              {MARKET_SESSIONS.map((session, index) => {
                const startPos = getTimelinePosition(session.openTime);
                const endPos = getTimelinePosition(session.closeTime);
                const isOpen = isMarketOpen(session, now);

                if (session.crossesMidnight) {
                  // Render two bars for markets that cross midnight
                  return (
                    <Tooltip key={session.id}>
                      <TooltipTrigger asChild>
                        <div className="cursor-pointer">
                          {/* First part: from open to midnight */}
                          <div
                            className="absolute h-5 rounded-sm transition-opacity hover:opacity-90"
                            style={{
                              left: `${startPos}%`,
                              width: `${100 - startPos}%`,
                              top: `${index * 24 + 8}px`,
                              backgroundColor: session.color,
                              opacity: isOpen ? 1 : 0.4,
                            }}
                          />
                          {/* Second part: from midnight to close */}
                          <div
                            className="absolute h-5 rounded-sm transition-opacity hover:opacity-90"
                            style={{
                              left: '0%',
                              width: `${endPos}%`,
                              top: `${index * 24 + 8}px`,
                              backgroundColor: session.color,
                              opacity: isOpen ? 1 : 0.4,
                            }}
                          />
                          {/* Label */}
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
                      <TooltipContent side="top" className="z-50">
                        {renderTooltipContent(session, isOpen)}
                      </TooltipContent>
                    </Tooltip>
                  );
                }

                return (
                  <Tooltip key={session.id}>
                    <TooltipTrigger asChild>
                      <div
                        className="absolute h-5 rounded-sm transition-opacity flex items-center px-2 cursor-pointer hover:opacity-90"
                        style={{
                          left: `${startPos}%`,
                          width: `${endPos - startPos}%`,
                          top: `${index * 24 + 8}px`,
                          backgroundColor: session.color,
                          opacity: isOpen ? 1 : 0.4,
                        }}
                      >
                        <span className="text-[10px] font-medium text-white drop-shadow-sm truncate">
                          {session.abbreviation}
                        </span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="z-50">
                      {renderTooltipContent(session, isOpen)}
                    </TooltipContent>
                  </Tooltip>
                );
              })}

              {/* Current time indicator */}
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-primary z-10 shadow-lg"
                style={{ left: `${currentTimePosition}%` }}
              >
                <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-primary rounded-full" />
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-primary rounded-full" />
              </div>
            </div>
          </div>

          {/* Legend and Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Market Status List */}
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-muted-foreground mb-3">Status dos Mercados</h4>
              <div className="grid grid-cols-2 gap-2">
                {MARKET_SESSIONS.map((session) => {
                  const isOpen = isMarketOpen(session, now);
                  const timeInfo = getTimeUntilChange(session, now);

                  return (
                    <div
                      key={session.id}
                      className="flex items-center gap-2 p-2 rounded-md bg-muted/30"
                    >
                      <div
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{ backgroundColor: session.color }}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-medium truncate">{session.name}</span>
                          <Badge
                            variant={isOpen ? 'default' : 'secondary'}
                            className={`text-[10px] px-1.5 py-0 h-4 ${
                              isOpen ? 'bg-green-500/20 text-green-500 hover:bg-green-500/30' : ''
                            }`}
                          >
                            {isOpen ? 'Aberto' : 'Fechado'}
                          </Badge>
                        </div>
                        <span className="text-[10px] text-muted-foreground">
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
                      className={`flex items-center justify-between p-2 rounded-md text-xs ${
                        index === 0 ? 'bg-primary/10 ring-1 ring-primary/20' : 'bg-muted/30'
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
                              ? 'bg-green-500/20 text-green-500'
                              : 'bg-red-500/20 text-red-500'
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
                        <span className="text-muted-foreground">
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
                  <div className="flex justify-between items-center p-2 rounded-md bg-green-500/10">
                    <span className="font-medium">B3 Futuro</span>
                    <span className="text-muted-foreground">09:00 - 18:30</span>
                  </div>
                  <div className="flex justify-between items-center p-2 rounded-md bg-green-500/10">
                    <span className="font-medium">B3 À Vista</span>
                    <span className="text-muted-foreground">10:00 - 17:55</span>
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
                        className="text-xs p-2 rounded-md bg-primary/10 text-primary"
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
