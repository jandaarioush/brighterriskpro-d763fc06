import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Globe } from 'lucide-react';
import { useLocalClock } from '@/hooks/useLocalClock';
import { formatDigitalClock } from '@/lib/formatting';
import {
  MARKET_SESSIONS,
  isMarketOpen,
  getTimeUntilChange,
  getOverlappingSessions,
  getTimelinePosition,
  getCurrentTimePosition,
} from '@/lib/marketSessions';

export default function MarketSessionsClock() {
  const now = useLocalClock(1000);
  const currentTimePosition = getCurrentTimePosition(now);
  const overlaps = getOverlappingSessions(now);

  const hours = Array.from({ length: 24 }, (_, i) => i);

  return (
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
          <div className="flex justify-between text-xs text-muted-foreground mb-2 px-1">
            {hours.filter((_, i) => i % 3 === 0).map((hour) => (
              <span key={hour} className="w-6 text-center">
                {hour.toString().padStart(2, '0')}
              </span>
            ))}
          </div>

          {/* Timeline container */}
          <div className="relative h-40 bg-muted/30 rounded-lg overflow-hidden">
            {/* Grid lines */}
            <div className="absolute inset-0 flex">
              {hours.filter((_, i) => i % 3 === 0).map((hour) => (
                <div
                  key={hour}
                  className="border-l border-border/30 h-full"
                  style={{ marginLeft: `${(hour / 24) * 100}%`, position: 'absolute' }}
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
                  <div key={session.id}>
                    {/* First part: from open to midnight */}
                    <div
                      className="absolute h-5 rounded-sm transition-opacity"
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
                      className="absolute h-5 rounded-sm transition-opacity"
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
                      className="absolute text-[10px] font-medium text-white drop-shadow-sm"
                      style={{
                        left: `${startPos + 1}%`,
                        top: `${index * 24 + 11}px`,
                      }}
                    >
                      {session.abbreviation}
                    </span>
                  </div>
                );
              }

              return (
                <div
                  key={session.id}
                  className="absolute h-5 rounded-sm transition-opacity flex items-center px-2"
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
  );
}
